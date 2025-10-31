const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');

const sendToken = (user, res) => {
  const token = user.getSignedJwtToken();
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, leaveBalance: user.leaveBalance } });
};

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, role } = req.body;
  const validRoles = ['team_member', 'team_leader', 'team_manager', 'general_manager'];
  const roleToUse = validRoles.includes(role) ? role : 'team_member';
  const user = await User.create({ name, email, password, role: roleToUse, department });
  sendToken(user, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorResponse('Email and password required', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new ErrorResponse('Invalid credentials', 401));
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));
  sendToken(user, res);
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.matchPassword(currentPassword || '');
  if (!isMatch) return next(new ErrorResponse('Password is incorrect', 401));
  user.password = newPassword;
  await user.save();
  res.json({ success: true });
});
