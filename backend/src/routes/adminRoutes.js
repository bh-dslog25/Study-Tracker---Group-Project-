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
const ADMIN_PASSWORD = process.env.ADMIN_ACCESS_PASSWORD || 'admin123';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Please enter email and password', 400);
    }
    const user = await User.findOne({ where: { email, role: 'teacher', isActive: true } });
    if (!user) return errorResponse(res, 'Teacher account not found', 401);
    if (password !== ADMIN_PASSWORD) return errorResponse(res, 'Incorrect password', 401);

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );
    return successResponse(res, {
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      accessToken,
    }, 'Admin login successful');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== DANH SÁCH HỌC SINH ONLINE =====
router.get('/online-users', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const onlineUserIds = getOnlineUsers();
    return successResponse(res, { onlineUserIds }, 'Get online users list successfully');
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

    return successResponse(res, studentsWithOnline, 'Get students list successfully');
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
    if (!student) return errorResponse(res, 'Student not found', 404);

    const classes = await Class.findAll({
      include: [{
        model: ClassMember, as: 'members',
        where: { studentId: student.id, status: 'active' },
        required: true,
        attributes: []
      }],
      attributes: ['id', 'name', 'inviteCode'],
    });

    return successResponse(res, { student, classes }, 'Get student details successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== THÊM HỌC SINH MỚI =====
router.post('/students', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return errorResponse(res, 'Please provide email, username and password', 400);
    }
    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'student',
      isActive: true,
    });

    return successResponse(res, {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    }, 'Student created successfully', 201);
  } catch (err) {
    console.error('Create student error:', err);
    return errorResponse(res, err.message || 'Failed to create student', 500);
  }
});

  // ===== DANH SÁCH YÊU CẤU VÀO LỚP (PENDING) - Chỉ lấy của teacher hiện tại =====
  router.get('/join-requests', authenticate, authorizeRoles('teacher'), async (req, res) => {
    try {
      // Lấy tất cả class của teacher này
      const teacherClasses = await Class.findAll({
        where: { teacherId: req.user.id },
        attributes: ['id'],
      });
      const classIds = teacherClasses.map(c => c.id);

      if (classIds.length === 0) {
        return successResponse(res, [], 'Get join requests successfully');
      }

      const requests = await ClassMember.findAll({
        where: { status: 'pending', classId: classIds },
        order: [['createdAt', 'DESC']],
      });

      const formatted = await Promise.all(requests.map(async (r) => {
        let studentName = null;
        let studentEmail = null;
        let className = null;
        let classInviteCode = null;

        try {
          const student = await User.findOne({
            where: { id: r.studentId },
            attributes: ['username', 'email'],
          });
          studentName = student?.username;
          studentEmail = student?.email;
        } catch (err) {
          console.error('Error fetching student for join request:', err);
        }

        try {
          const cls = await Class.findOne({
            where: { id: r.classId },
            attributes: ['name', 'inviteCode'],
          });
          className = cls?.name;
          classInviteCode = cls?.inviteCode;
        } catch (err) {
          console.error('Error fetching class for join request:', err);
        }

        return {
          id: r.id,
          classId: r.classId,
          className,
          classInviteCode,
          studentId: r.studentId,
          studentName,
          studentEmail,
          requestedAt: r.createdAt,
        };
      }));

      return successResponse(res, formatted, 'Get join requests successfully');
    } catch (err) {
      console.error('Get join requests error:', err);
      return errorResponse(res, err.message || 'Failed to get join requests', 500);
    }
  });

// ===== DUYỆT YÊU CẦU VÀO LỚP =====
router.put('/join-requests/:requestId/approve', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const member = await ClassMember.findByPk(requestId);
    if (!member) return errorResponse(res, 'Request not found', 404);
    if (member.status !== 'pending') return errorResponse(res, 'Request already processed', 400);

    await member.update({ status: 'active', joinedAt: new Date() });
    return successResponse(res, null, 'Join request approved');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== TỪ CHỐI YÊU CẦU VÀO LỚP =====
router.put('/join-requests/:requestId/reject', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const member = await ClassMember.findByPk(requestId);
    if (!member) return errorResponse(res, 'Request not found', 404);
    if (member.status !== 'pending') return errorResponse(res, 'Request already processed', 400);

    await member.destroy();
    return successResponse(res, null, 'Join request rejected');
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
    return successResponse(res, classes, 'Get classes list successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== THÊM HỌC SINH VÀO LỚP =====
router.post('/classes/:classId/add-student', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const { email } = req.body;
    if (!email) return errorResponse(res, 'Please enter student email', 400);

    const cls = await Class.findOne({ where: { id: classId, teacherId: req.user.id } });
    if (!cls) return errorResponse(res, 'Class not found', 404);

    const student = await User.findOne({ where: { email, role: 'student', isActive: true } });
    if (!student) return errorResponse(res, 'Student not found with this email', 404);

    const existing = await ClassMember.findOne({ where: { classId, studentId: student.id } });
    if (existing) {
      if (existing.status === 'active') return errorResponse(res, 'Student is already in this class', 409);
      await existing.update({ status: 'active', joinedAt: new Date() });
      return successResponse(res, { studentId: student.id, username: student.username }, 'Student re-added to class');
    }

    const count = await ClassMember.count({ where: { classId, status: 'active' } });
    if (count >= cls.maxStudents) return errorResponse(res, 'Class is full', 400);

    await ClassMember.create({ classId, studentId: student.id });
    return successResponse(res, { studentId: student.id, username: student.username }, 'Add student to class successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== OVERVIEW LỚP (gồm task progress + goal) =====
router.get('/classes/:classId/overview', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const cls = await Class.findOne({ where: { id: classId, teacherId: req.user.id } });
    if (!cls) return errorResponse(res, 'Class not found', 404);

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
      }, 'Get class details successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== XÓA HỌC SINH KHỎI LỚP =====
router.delete('/classes/:classId/students/:studentId', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const studentId = parseInt(req.params.studentId);

    const cls = await Class.findOne({ where: { id: classId, teacherId: req.user.id } });
    if (!cls) return errorResponse(res, 'Class not found', 404);

    const member = await ClassMember.findOne({ where: { classId, studentId } });
    if (!member) return errorResponse(res, 'Student is not in this class', 404);

    await member.update({ status: 'inactive' });
    return successResponse(res, null, 'Student removed from class successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ===== DANH SÁCH HỌC SINH TRONG LỚP (có pagination) =====
router.get('/classes/:classId/students', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const cls = await Class.findOne({ where: { id: classId, teacherId: req.user.id } });
    if (!cls) return errorResponse(res, 'Class not found', 404);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: members } = await ClassMember.findAndCountAll({
      where: { classId, status: 'active' },
      include: [{
        model: User, as: 'student',
        attributes: ['id', 'username', 'email', 'isActive', 'lastLogin'],
      }],
      limit,
      offset,
      order: [['joinedAt', 'DESC']],
    });

    const result = members
      .filter(m => m.student) // only include members with valid student records
      .map(m => ({
        id: m.student.id,
        username: m.student.username,
        email: m.student.email,
        isActive: m.student.isActive,
        joinedAt: m.joinedAt,
        lastLogin: m.student.lastLogin,
      }));

    return successResponse(res, {
      data: result,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    }, 'Get class students list successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;