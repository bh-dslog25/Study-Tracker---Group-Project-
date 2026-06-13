'use strict';
const router = require('express').Router();
const authenticate = require('../middleware/authMiddleware');
// Debug: Kiểm tra xem middleware có load được không
console.log('Middleware authenticate check:', authenticate ? 'OK' : 'UNDEFINED');

// Public routes (Không cần đăng nhập)
router.use('/auth', require('./authRoutes'));

// Protected routes (Tất cả các route bên dưới cần đăng nhập)
router.use(authenticate); 

// Các route này tự động được bảo vệ bởi middleware ở trên
router.use('/goals',    require('./goalRoutes'));
router.use('/tasks',    require('./taskRoutes'));
router.use('/timelogs', require('./timeLogRoutes'));
router.use('/classes',  require('./classRoutes'));

module.exports = router;