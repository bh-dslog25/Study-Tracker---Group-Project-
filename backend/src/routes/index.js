'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');

// Public
router.use('/auth', require('./authRoutes'));

// Protected — tất cả routes bên dưới đều cần đăng nhập
router.use(authenticate);
router.use('/goals',    require('./goalRoutes'));
router.use('/tasks',    require('./taskRoutes'));
router.use('/timelogs', require('./timeLogRoutes'));
router.use('/classes',  require('./classRoutes'));

module.exports = router;