'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl           = require('../controllers/classController');
const taskCtrl       = require('../controllers/classTaskController');
const scheduleCtrl   = require('../controllers/classScheduleController');
const progressCtrl   = require('../controllers/progressController');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validate }       = require('../middleware/validateMiddleware');

// ===== TEACHER: quản lý lớp =====
router.post('/', authorizeRoles('teacher'), [
  body('name').trim().notEmpty().withMessage('Tên lớp không được để trống'),
  validate,
], ctrl.createClass);

router.get('/my-classes',           authorizeRoles('teacher'), ctrl.getMyClasses);
router.get('/:id/detail',           authorizeRoles('teacher'), ctrl.getClassDetail);
router.put('/:id',                  authorizeRoles('teacher'), ctrl.updateClass);
router.delete('/:id',               authorizeRoles('teacher'), ctrl.deleteClass);
router.delete('/:id/students/:studentId', authorizeRoles('teacher'), ctrl.removeStudent);

// ===== TEACHER: nhiệm vụ lớp =====
router.post('/:classId/tasks',           authorizeRoles('teacher'), [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  validate,
], taskCtrl.create);
router.put('/:classId/tasks/:taskId',    authorizeRoles('teacher'), taskCtrl.update);
router.delete('/:classId/tasks/:taskId', authorizeRoles('teacher'), taskCtrl.remove);

// ===== TEACHER: lịch học =====
router.post('/:classId/schedules', authorizeRoles('teacher'), [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  body('startTime').isISO8601().withMessage('Thời gian bắt đầu không hợp lệ'),
  body('endTime').isISO8601().withMessage('Thời gian kết thúc không hợp lệ'),
  validate,
], scheduleCtrl.create);
router.put('/:classId/schedules/:scheduleId',    authorizeRoles('teacher'), scheduleCtrl.update);
router.delete('/:classId/schedules/:scheduleId', authorizeRoles('teacher'), scheduleCtrl.remove);

// ===== TEACHER: theo dõi tiến độ =====
router.get('/:classId/progress',                          authorizeRoles('teacher'), progressCtrl.getClassProgress);
router.get('/:classId/progress/:studentId',               authorizeRoles('teacher'), progressCtrl.getStudentProgress);

// ===== STUDENT: tham gia lớp =====
router.post('/join', authorizeRoles('student'), [
  body('inviteCode').trim().notEmpty().withMessage('Mã lớp không được để trống'),
  validate,
], ctrl.joinClass);
router.get('/joined',          authorizeRoles('student'), ctrl.getJoinedClasses);
router.delete('/:id/leave',    authorizeRoles('student'), ctrl.leaveClass);

// ===== STUDENT + TEACHER: xem chung =====
router.get('/:classId/tasks',     ctrl.getMyClasses); // override bằng service check role
router.get('/:classId/schedules', scheduleCtrl.getByClass);

// ===== STUDENT: cập nhật tiến độ bản thân =====
router.get('/:classId/my-progress',               authorizeRoles('student'), progressCtrl.getMyProgress);
router.patch('/progress/:progressId',             authorizeRoles('student'), [
  body('status').isIn(['in_progress', 'completed']).withMessage('Trạng thái không hợp lệ'),
  validate,
], progressCtrl.updateMyProgress);

module.exports = router;