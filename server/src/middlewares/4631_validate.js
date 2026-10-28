const { sendError } = require('../utils/4631_responseEnvelope');

/**
 * Higher-order middleware to validate incoming request data using Joi schemas.
 * @param {import('joi').ObjectSchema} schema - The Joi validation schema
 * @param {'body' | 'query' | 'params'} source - The property of req to validate (default: 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,     // Return all validation errors, not just the first
      stripUnknown: true     // Remove unknown fields for cleaner payloads
    });

    if (error) {
      const errorDetails = error.details.map(detail => detail.message);
      const combinedMessage = errorDetails.join('; ');

      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        combinedMessage,
        errorDetails
      );
    }

    // Replace request payload with sanitized, type-cast Joi value
    req[source] = value;
    next();
  };
};

module.exports = {
  validate
};
