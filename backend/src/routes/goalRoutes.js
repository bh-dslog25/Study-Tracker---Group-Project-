'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/goalController');
const { validate } = require('../middleware/validateMiddleware');

// Tất cả student/teacher đều dùng được (mục tiêu cá nhân)
router.get('/', ctrl.getAll);
router.post('/', [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  body('targetHours').isFloat({ min: 0.1 }).withMessage('Mục tiêu giờ học phải lớn hơn 0'),
  body('startDate').isDate().withMessage('Ngày bắt đầu không hợp lệ'),
  body('endDate').isDate().withMessage('Ngày kết thúc không hợp lệ'),
  body('type').isIn(['daily', 'weekly', 'monthly', 'custom']),
  validate,
], ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;