'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/taskController');
const { validate } = require('../middleware/validateMiddleware');

router.get('/', ctrl.getAll);
router.post('/', [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isDate(),
  validate,
], ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;