const ErrorResponse = require('../utils/ErrorResponse');

module.exports = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  res.status(status).json({ success: false, message });
};
