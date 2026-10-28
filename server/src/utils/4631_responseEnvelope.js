/**
 * Standardized API Response Envelope according to Technical Feasibility Section 7:
 * Success: { success: true, data: ... }
 * Error:   { success: false, error: { code: '...', message: '...' } }
 */

const sendSuccess = (res, data = null, statusCode = 200, message = null) => {
  const response = {
    success: true,
    data
  };
  if (message) {
    response.message = message;
  }
  return res.status(statusCode).json(response);
};

const sendCreated = (res, data = null, message = 'Resource created successfully') => {
  return sendSuccess(res, data, 201, message);
};

const sendError = (res, statusCode = 500, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred', details = null) => {
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError
};
