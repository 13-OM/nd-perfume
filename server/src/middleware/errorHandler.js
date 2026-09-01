const ApiError = require('../utils/ApiError');

/** 404 handler */
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/** Central error handler — keeps every response shape consistent */
function errorHandler(err, req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }
  if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value. Please use a different one.';
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier provided';
  }
  if (err.name === 'MulterError') {
    status = 400;
    message = `Upload error: ${err.message}`;
  }

  console.error('✖', status, message, err.stack?.split('\n')[1] || '');
  res.status(status).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
