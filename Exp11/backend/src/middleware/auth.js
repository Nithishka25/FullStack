const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new ErrorResponse('Not authorized', 401));
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const user = await User.findById(decoded.id);
    if (!user) return next(new ErrorResponse('User not found', 401));
    req.user = user;
    next();
  } catch (err) {
    next(new ErrorResponse('Not authorized', 401));
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ErrorResponse('Forbidden', 403));
  }
  next();
};
