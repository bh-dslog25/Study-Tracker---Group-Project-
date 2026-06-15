'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.post('/register', [
  body('name')
    .custom((value, { req }) => Boolean(value || req.body.username))
    .withMessage('Ten khong duoc de trong'),
  body('email').isEmail().withMessage('Email khong hop le').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mat khau it nhat 6 ky tu'),
  body('role').optional().isIn(['student', 'teacher']).withMessage('Role khong hop le'),
  validate,
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Email khong hop le'),
  body('password').notEmpty().withMessage('Mat khau khong duoc de trong'),
  validate,
], authController.login);

router.post('/refresh', authController.refresh);

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
