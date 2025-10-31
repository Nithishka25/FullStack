const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');

// GET /api/users
// List all users (general_manager only)
exports.listUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}, 'name email role department manager').populate('manager', 'name email');
  res.json({ success: true, count: users.length, data: users });
});

// GET /api/users/managers
// List potential managers (team_leader, team_manager, general_manager)
exports.listManagers = asyncHandler(async (req, res, next) => {
  const managers = await User.find({ role: { $in: ['team_leader', 'team_manager', 'general_manager'] } }, 'name email role');
  res.json({ success: true, count: managers.length, data: managers });
});

// GET /api/users/department
// List users in the same department (team_manager only) - shows team_members
exports.listDepartmentUsers = asyncHandler(async (req, res, next) => {
  const dept = req.user.department;
  const users = await User.find({ department: dept, role: 'team_member' }, 'name email department role');
  res.json({ success: true, count: users.length, data: users });
});

// PUT /api/users/:id
// Update user's role and/or manager (general_manager only)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { role, manager } = req.body;

  const validRoles = ['team_member', 'team_leader', 'team_manager', 'general_manager'];
  const update = {};
  if (role) {
    if (!validRoles.includes(role)) return next(new ErrorResponse('Invalid role', 400));
    update.role = role;
  }
  if (typeof manager !== 'undefined') {
    update.manager = manager || null;
  }

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).populate('manager', 'name email');
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.json({ success: true, data: user });
});

// DELETE /api/users/:id
// Delete a user (general_manager only)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (String(id) === String(req.user._id)) {
    return next(new ErrorResponse('You cannot delete your own account', 400));
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.json({ success: true });
});
