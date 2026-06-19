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
  body('title').trim().notEmpty().withMessage('Title is required'),
  validate,
], ctrl.create);
router.put('/:id', [validate], ctrl.update);
router.delete('/:id', ctrl.remove);

// Task management inside Goal
router.post('/:id/tasks', [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  validate,
], ctrl.addTask);
router.put('/:id/tasks/:taskId/toggle', ctrl.toggleTask);
router.delete('/:id/tasks/:taskId', ctrl.removeTask);

module.exports = router;