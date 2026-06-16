'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/goalController');
const { validate } = require('../middleware/validateMiddleware');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

// Goal CRUD
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  validate,
], ctrl.create);
router.put('/:id', [validate], ctrl.update);
router.delete('/:id', ctrl.remove);

// Task management inside Goal
router.post('/:id/tasks', [
  body('title').trim().notEmpty().withMessage('Tiêu đề nhiệm vụ không được để trống'),
  validate,
], ctrl.addTask);
router.put('/:id/tasks/:taskId/toggle', ctrl.toggleTask);
router.delete('/:id/tasks/:taskId', ctrl.removeTask);

module.exports = router;