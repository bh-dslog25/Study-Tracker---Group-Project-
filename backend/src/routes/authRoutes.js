'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Tên không được để trống').isLength({ min: 2 }),
  body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu ít nhất 6 ký tự'),
  body('role').optional().isIn(['student', 'teacher']).withMessage('Role không hợp lệ'),
  validate,
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
  validate,
], authController.login);

router.post('/refresh', authController.refresh);

// Protected
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/me', authController.updateMe);
router.put('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  validate,
], authController.changePassword);

module.exports = router;