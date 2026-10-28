const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/4631_authController');
const { authenticate } = require('../middlewares/4631_auth');
const { validate } = require('../middlewares/4631_validate');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/4631_schemas');

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes (any authenticated user)
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;
