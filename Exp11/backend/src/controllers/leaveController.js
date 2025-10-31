const Leave = require('../models/Leave');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');

// Helper to compute inclusive days
const diffDaysInclusive = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diff, 0);
};

// GET /api/leaves
exports.list = asyncHandler(async (req, res) => {
  if (req.user.role === 'general_manager') {
    const leaves = await Leave.find({})
      .populate('user', 'name email role department')
      .populate('approvedBy', 'name role');
    return res.json({ success: true, count: leaves.length, data: leaves });
  }

  if (req.user.role === 'team_manager') {
    // Manager sees team_member leaves in their department + their own leaves
    const teamMembers = await User.find({ department: req.user.department, role: 'team_member' }, '_id');
    const leaves = await Leave.find({
      $or: [
        { user: { $in: teamMembers.map(t => t._id) } },
        { user: req.user._id },
      ]
    })
      .populate('user', 'name email role department')
      .populate('approvedBy', 'name role');
    return res.json({ success: true, count: leaves.length, data: leaves });
  }

  // Default: own leaves only (team_member, team_leader, etc.)
  const leaves = await Leave.find({ user: req.user.id })
    .populate('user', 'name email role department')
    .populate('approvedBy', 'name role');
  res.json({ success: true, count: leaves.length, data: leaves });
});

// POST /api/leaves
exports.apply = asyncHandler(async (req, res, next) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  if (!leaveType || !startDate || !endDate || !reason)
    return next(new ErrorResponse('Missing fields', 400));

  // overlap check (excluding rejected)
  const overlapping = await Leave.find({
    user: req.user.id,
    status: { $ne: 'rejected' },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
    ],
  });
  if (overlapping.length) return next(new ErrorResponse('Overlapping leave request exists', 400));

  const user = await User.findById(req.user.id);
  const days = diffDaysInclusive(startDate, endDate);
  if (leaveType !== 'unpaid' && (user.leaveBalance[leaveType] || 0) < days) {
    return next(new ErrorResponse(`Insufficient ${leaveType} balance`, 400));
  }

  const leave = await Leave.create({ user: req.user.id, leaveType, startDate, endDate, reason });
  res.status(201).json({ success: true, data: leave });
});

// PUT /api/leaves/:id/status
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const { status, reason } = req.body; // status in ['approved','rejected']
  const leave = await Leave.findById(req.params.id).populate('user');
  if (!leave) return next(new ErrorResponse('Leave not found', 404));

  // Prevent self-approval
  if (String(leave.user._id) === String(req.user._id)) {
    return next(new ErrorResponse('You cannot approve your own leave', 403));
  }

  const targetUser = await User.findById(leave.user._id);

  // Enforce approval rules
  if (targetUser.role === 'team_member') {
    if (!(req.user.role === 'team_manager' && req.user.department === targetUser.department)) {
      return next(new ErrorResponse('Only the concerned department manager can approve this leave', 403));
    }
  } else if (targetUser.role === 'team_manager') {
    if (req.user.role !== 'general_manager') {
      return next(new ErrorResponse('Manager leaves can only be approved by Administrator', 403));
    }
  } else {
    return next(new ErrorResponse('Unsupported approval target', 403));
  }
  if (leave.status !== 'pending') {
    return next(new ErrorResponse('Leave already processed', 400));
  }

  leave.status = status;
  leave.approvedBy = req.user.id;
  if (status === 'rejected' && reason) leave.rejectionReason = reason;

  if (status === 'approved') {
    const days = diffDaysInclusive(leave.startDate, leave.endDate);
    if (leave.leaveType !== 'unpaid') {
      const user = await User.findById(leave.user._id);
      if ((user.leaveBalance[leave.leaveType] || 0) < days) {
        return next(new ErrorResponse('Insufficient balance at approval', 400));
      }
      user.leaveBalance[leave.leaveType] -= days;
      await user.save();
    }
  }

  await leave.save();
  res.json({ success: true, data: leave });
});

// PUT /api/leaves/:id/cancel
exports.cancel = asyncHandler(async (req, res, next) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) return next(new ErrorResponse('Leave not found', 404));
  if (leave.user.toString() !== req.user.id && req.user.role !== 'admin')
    return next(new ErrorResponse('Forbidden', 403));
  if (leave.status !== 'pending')
    return next(new ErrorResponse('Only pending leaves can be cancelled', 400));
  leave.status = 'cancelled';
  await leave.save();
  res.json({ success: true });
});

// GET /api/leaves/statement
// Download CSV of user's leaves (optionally filter by from/to)
exports.statement = asyncHandler(async (req, res, next) => {
  const { from, to } = req.query;
  const userId = req.user.id;
  const filter = { user: userId };
  if (from || to) {
    filter.$and = [];
    if (from) filter.$and.push({ endDate: { $gte: new Date(from) } });
    if (to) filter.$and.push({ startDate: { $lte: new Date(to) } });
  }

  const leaves = await Leave.find(filter).populate('approvedBy', 'name');

  const rows = [
    ['Type', 'Start', 'End', 'Days', 'Status', 'Reason', 'Approved By'],
    ...leaves.map((l) => [
      l.leaveType,
      new Date(l.startDate).toISOString().slice(0, 10),
      new Date(l.endDate).toISOString().slice(0, 10),
      String(diffDaysInclusive(l.startDate, l.endDate)),
      l.status,
      (l.reason || '').replace(/\n|\r/g, ' '),
      l.approvedBy ? l.approvedBy.name : '',
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');

  const filename = `leave_statement_${(from || 'all')}_to_${(to || 'all')}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});
