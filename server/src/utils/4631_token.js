const jwt = require('jsonwebtoken');
const env = require('../config/4631_env');

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d'
  });
};

const verifyTokenString = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyTokenString
};
