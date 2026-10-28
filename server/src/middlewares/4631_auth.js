const { verifyTokenString } = require('../utils/4631_token');
const { sendError } = require('../utils/4631_responseEnvelope');
const { User } = require('../models/4631_User');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token || token === 'null' || token === 'undefined') {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication token is required to access this resource.');
    }

    let decoded;
    try {
      decoded = verifyTokenString(token);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 401, 'TOKEN_EXPIRED', 'Your session has expired. Please log in again.');
      }
      return sendError(res, 401, 'INVALID_TOKEN', 'Invalid authentication token.');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 401, 'USER_NOT_FOUND', 'The user belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        `Access denied. Role '${req.user ? req.user.role : 'GUEST'}' is not authorized to access this route.`
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles
};
