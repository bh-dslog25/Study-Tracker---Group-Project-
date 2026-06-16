'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/timeLogController');
const { validate } = require('../middleware/validateMiddleware');

router.get('/',       ctrl.getAll);
router.get('/stats',  ctrl.getStats);
router.post('/start', [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  validate,
], ctrl.start);
router.put('/:id/stop', ctrl.stop);
router.delete('/:id',   ctrl.remove);

module.exports = router;