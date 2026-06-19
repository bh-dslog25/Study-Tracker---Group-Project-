'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, logout, changePassword, verifyAdminPassword } = require('../controllers/authController');
const { validate } = require('../middleware/validateMiddleware');
const authenticate = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['teacher', 'student']).withMessage('Role must be teacher or student'),
  validate,
], register);

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], login);

// POST /api/auth/logout (protected)
router.post('/logout', authenticate, logout);

// POST /api/auth/change-password (protected)
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
], changePassword);

// POST /api/auth/verify-admin-password
router.post('/verify-admin-password', [
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], verifyAdminPassword);

// GET /api/auth/status
router.get('/status', (req, res) => {
  res.json({ success: true, message: 'Auth routes OK' });
});

module.exports = router;