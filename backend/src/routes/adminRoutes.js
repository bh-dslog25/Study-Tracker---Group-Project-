'use strict';
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Class, ClassMember, ClassTask, StudentProgress, Goal } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/response');
const authenticate = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getOnlineUsers } = require('../utils/socket');

// (mật khẩu cố định, chỉ teacher mới biết)
const ADMIN_PASSWORD = 'admin@123';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Vui lòng nhập email và mật khẩu', 400);
    }
    const user = await User.findOne({ where: { email, role: 'teacher', isActive: true } });
    if (!user) return errorResponse(res, 'Tài khoản giáo viên không tồn tại', 401);
    if (password !== ADMIN_PASSWORD) return errorResponse(res, 'Mật khẩu chưa chính xác', 401);

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );
    return successResponse(res, {
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      accessToken,
    }, 'Đăng nhập admin thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== DANH SÁCH HỌC SINH ONLINE =====
router.get('/online-users', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const onlineUserIds = getOnlineUsers();
    return successResponse(res, { onlineUserIds }, 'Lấy danh sách người dùng online thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== DANH SÁCH HỌC SINH (có trạng thái) =====
router.get('/students', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'username', 'email', 'isActive', 'createdAt', 'lastLogin'],
      order: [['createdAt', 'DESC']],
    });

    // Gắn trạng thái online cho từng học sinh
    const onlineUserIds = getOnlineUsers();
    const studentsWithOnline = students.map(s => ({
      ...s.toJSON(),
      isOnline: onlineUserIds.includes(s.id),
    }));

    return successResponse(res, studentsWithOnline, 'Lấy danh sách học sinh thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== CHI TIẾT HỌC SINH (gồm lớp tham gia) =====
router.get('/students/:studentId', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const student = await User.findOne({
      where: { id: req.params.studentId, role: 'student' },
      attributes: ['id', 'username', 'email', 'isActive', 'createdAt', 'lastLogin'],
    });
    if (!student) return errorResponse(res, 'Không tìm thấy học sinh', 404);

    const classes = await Class.findAll({
      include: [{
        model: ClassMember, as: 'members',
        where: { studentId: student.id, status: 'active' },
        required: true,
        attributes: []
      }],
      attributes: ['id', 'name', 'inviteCode'],
    });

    return successResponse(res, { student, classes }, 'Lấy chi tiết học sinh thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== DANH SÁCH LỚP =====
router.get('/classes', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classes = await Class.findAll({
      where: { teacherId: req.user.id },
      include: [{
        model: ClassMember, as: 'members',
        where: { status: 'active' },
        required: false,
        attributes: ['studentId'],
      }],
      attributes: ['id', 'name', 'inviteCode', 'isActive', 'maxStudents', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, classes, 'Lấy danh sách lớp thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== THÊM HỌC SINH VÀO LỚP =====
router.post('/classes/:classId/add-student', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const { email } = req.body;
    if (!email) return errorResponse(res, 'Vui lòng nhập email học sinh', 400);

    const cls = await Class.findOne({ where: { id: classId, teacherId: req.user.id } });
    if (!cls) return errorResponse(res, 'Không tìm thấy lớp học', 404);

    const student = await User.findOne({ where: { email, role: 'student', isActive: true } });
    if (!student) return errorResponse(res, 'Không tìm thấy học sinh với email này', 404);

    const existing = await ClassMember.findOne({ where: { classId, studentId: student.id } });
    if (existing) {
      if (existing.status === 'active') return errorResponse(res, 'Học sinh đã ở trong lớp này', 409);
      await existing.update({ status: 'active', joinedAt: new Date() });
      return successResponse(res, { studentId: student.id, username: student.username }, 'Đã thêm lại học sinh vào lớp');
    }

    const count = await ClassMember.count({ where: { classId, status: 'active' } });
    if (count >= cls.maxStudents) return errorResponse(res, 'Lớp học đã đầy', 400);

    await ClassMember.create({ classId, studentId: student.id });
    return successResponse(res, { studentId: student.id, username: student.username }, 'Thêm học sinh vào lớp thành công', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== OVERVIEW LỚP (gồm task progress + goal) =====
router.get('/classes/:classId/overview', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const cls = await Class.findOne({ where: { id: classId, teacherId: req.user.id } });
    if (!cls) return errorResponse(res, 'Không tìm thấy lớp học', 404);

    // Lấy học sinh active trong lớp
    const members = await ClassMember.findAll({
      where: { classId, status: 'active' },
      include: [{
        model: User, as: 'student',
        attributes: ['id', 'username', 'email', 'isActive', 'lastLogin'],
      }],
    });

    // Lấy ClassTask
    const tasks = await ClassTask.findAll({
      where: { classId },
      attributes: ['id', 'title'],
    });

    // Lấy progress
    const studentIds = members.map(m => m.student.id);
    const taskIds = tasks.map(t => t.id);
    const progresses = await StudentProgress.findAll({
      where: { classId, classTaskId: { [Op.in]: taskIds }, studentId: { [Op.in]: studentIds } },
      attributes: ['studentId', 'classTaskId', 'status'],
    });

    // Lấy Goal của từng học sinh (mục tiêu học tập)
    const goals = await Goal.findAll({
      where: { 
        userId: { [Op.in]: studentIds },
        status: { [Op.in]: ['active', 'completed'] }
      },
      attributes: ['userId', 'targetHours', 'achievedHours', 'status', 'title'],
    });

    // Build data
    const studentsWithStats = members.map(m => {
      const studentProgresses = progresses.filter(p => p.studentId === m.student.id);
      const totalTasks = tasks.length;
      const completed = studentProgresses.filter(p => p.status === 'completed').length;
      const inProgress = studentProgresses.filter(p => p.status === 'in_progress').length;
      const assigned = studentProgresses.filter(p => p.status === 'assigned').length;
      const late = studentProgresses.filter(p => p.status === 'late').length;

      // Goal stats
      const studentGoals = goals.filter(g => g.userId === m.student.id);
      const totalGoals = studentGoals.length;
      const completedGoals = studentGoals.filter(g => g.status === 'completed').length;
      const totalTargetHours = studentGoals.reduce((sum, g) => sum + parseFloat(g.targetHours || 0), 0);
      const totalAchievedHours = studentGoals.reduce((sum, g) => sum + parseFloat(g.achievedHours || 0), 0);

      return {
        id: m.student.id,
        username: m.student.username,
        email: m.student.email,
        isActive: m.student.isActive,
        lastLogin: m.student.lastLogin,
        joinedAt: m.joinedAt,
        stats: {
          totalTasks,
          completed,
          inProgress,
          assigned,
          late,
          progressPercent: totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0,
        },
        goals: {
          totalGoals,
          completedGoals,
          targetHours: totalTargetHours,
          achievedHours: totalAchievedHours,
          goalPercent: totalTargetHours > 0 ? Math.round((totalAchievedHours / totalTargetHours) * 100) : 0,
        },
      };
    });

      // Gắn trạng thái online cho từng học sinh
      const onlineUserIds = getOnlineUsers();
      const studentsWithOnline = studentsWithStats.map(s => ({
        ...s,
        isOnline: onlineUserIds.includes(s.id),
      }));

      return successResponse(res, {
        classInfo: { id: cls.id, name: cls.name, inviteCode: cls.inviteCode, isActive: cls.isActive, maxStudents: cls.maxStudents },
        totalStudents: studentsWithOnline.length,
        totalTasks: tasks.length,
        students: studentsWithOnline,
      }, 'Lấy chi tiết lớp thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== DANH SÁCH HỌC SINH TRONG LỚP =====
router.get('/classes/:classId/students', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const cls = await Class.findOne({ where: { id: classId, teacherId: req.user.id } });
    if (!cls) return errorResponse(res, 'Không tìm thấy lớp học', 404);

    const members = await ClassMember.findAll({
      where: { classId, status: 'active' },
      include: [{
        model: User, as: 'student',
        attributes: ['id', 'username', 'email', 'isActive'],
      }],
    });

    return successResponse(res, members.map(m => ({
      id: m.student.id,
      username: m.student.username,
      email: m.student.email,
      isActive: m.student.isActive,
      joinedAt: m.joinedAt,
    })), 'Lấy danh sách học sinh trong lớp thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;