const { sendError } = require('../utils/4631_responseEnvelope');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Caught]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method
  });

  // Handle Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    return sendError(res, 400, 'INVALID_ID_FORMAT', `Invalid format for field: ${err.path}`);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return sendError(res, 400, 'VALIDATION_FAILED', messages.join(', '), messages);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return sendError(
      res,
      409,
      'DUPLICATE_RESOURCE_CONFLICT',
      `Duplicate entry for field(s): ${fields.join(', ')}. Please use unique values.`,
      err.keyValue
    );
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'INVALID_TOKEN', 'Access token is invalid');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'TOKEN_EXPIRED', 'Access token has expired. Please log in again');
  }

  // Custom App Error with statusCode
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage = err.message || 'An unexpected internal server error occurred';

  return sendError(res, statusCode, errorCode, errorMessage);
};

// 404 Route Not Found Middleware
const notFoundHandler = (req, res) => {
  return sendError(res, 404, 'ROUTE_NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
