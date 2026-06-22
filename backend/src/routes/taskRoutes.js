'use strict';
const router = require('express').Router();
const { ClassTask, ClassMember, StudentProgress, User, Class } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const authenticate = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { Op } = require('sequelize');

// GET /api/tasks/student/assigned — Lấy nhiệm vụ được giao cho student đang đăng nhập
router.get('/student/assigned', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Lấy danh sách classId mà student đã tham gia (active)
    const memberships = await ClassMember.findAll({
      where: { studentId, status: 'active' },
      attributes: ['classId'],
    });
    const classIds = memberships.map(m => m.classId);

    if (classIds.length === 0) {
      return successResponse(res, [], 'Get assigned tasks successfully');
    }

    // Lấy tất cả task thuộc các class đó
    const tasks = await ClassTask.findAll({
      where: {
        classId: classIds,
      },
      include: [{
        model: Class,
        as: 'class',
        attributes: ['id', 'name'],
      }],
      attributes: ['id', 'classId', 'title', 'description', 'deadline', 'priority', 'assignedTo'],
      order: [['createdAt', 'DESC']],
    });

    // Lọc: nếu assignedTo=[] → hiển thị cho tất cả student trong class
    // Nếu assignedTo có ID cụ thể → chỉ hiển thị nếu studentId nằm trong mảng
    const myTasks = tasks
      .filter(task => {
        try {
          const ids = JSON.parse(task.assignedTo || '[]');
          // assignedTo=[] hoặc null → giao cho tất cả student
          if (!ids || ids.length === 0) return true;
          return ids.includes(studentId);
        } catch (e) {
          return true;
        }
      })
      .map(task => ({
        ...task.toJSON(),
        isDone: false,
      }));

    return successResponse(res, myTasks, 'Get assigned tasks successfully');
  } catch (err) {
    console.error('Error fetching assigned tasks:', err);
    return errorResponse(res, err.message, 500);
  }
});

// PUT /api/tasks/student/:taskId/submit — Nộp bài (student)
router.put('/student/:taskId/submit', authenticate, async (req, res) => {
  try {
    // Self-healing: ensure submission columns exist
    const queryInterface = req.app.get('sequelize').getQueryInterface();
    try {
      await queryInterface.describeTable('student_progresses').then(cols => {
        if (!cols.submission) {
          return queryInterface.addColumn('student_progresses', 'submission', { type: 'TEXT', allowNull: true });
        }
      });
      await queryInterface.describeTable('student_progresses').then(cols => {
        if (!cols.submittedAt) {
          return queryInterface.addColumn('student_progresses', 'submittedAt', { type: 'DATE', allowNull: true });
        }
      });
    } catch (e) {
      console.log('Column check/add error (non-critical):', e.message);
    }

    const studentId = req.user.id;
    const taskId = parseInt(req.params.taskId);
    const { submission } = req.body;

    if (!submission || !submission.trim()) {
      return errorResponse(res, 'Please enter your submission', 400);
    }

    // Kiểm tra task tồn tại và student thuộc class
    const task = await ClassTask.findByPk(taskId);
    if (!task) return errorResponse(res, 'Task not found', 404);

    const member = await ClassMember.findOne({
      where: { classId: task.classId, studentId, status: 'active' },
    });
    if (!member) return errorResponse(res, 'You are not a member of this class', 403);

    // Upsert progress
    const [progress, created] = await StudentProgress.findOrCreate({
      where: { classId: task.classId, classTaskId: taskId, studentId },
      defaults: {
        status: 'completed',
        submission: submission.trim(),
        submittedAt: new Date(),
      },
    });

    if (!created) {
      await progress.update({
        status: 'completed',
        submission: submission.trim(),
        submittedAt: new Date(),
      });
    }

    return successResponse(res, progress, 'Task submitted successfully');
  } catch (err) {
    console.error('Submit task error:', err);
    return errorResponse(res, err.message, 500);
  }
});

// PUT /api/tasks/student/:taskId/progress — Cập nhật trạng thái (in_progress / completed)
router.put('/student/:taskId/progress', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const taskId = parseInt(req.params.taskId);
    const { status } = req.body;

    if (!status || !['assigned', 'in_progress', 'completed'].includes(status)) {
      return errorResponse(res, 'Invalid status', 400);
    }

    const task = await ClassTask.findByPk(taskId);
    if (!task) return errorResponse(res, 'Task not found', 404);

    const member = await ClassMember.findOne({
      where: { classId: task.classId, studentId, status: 'active' },
    });
    if (!member) return errorResponse(res, 'You are not a member of this class', 403);

    const [progress, created] = await StudentProgress.findOrCreate({
      where: { classId: task.classId, classTaskId: taskId, studentId },
      defaults: { status },
    });

    if (!created) {
      await progress.update({ status });
    }

    return successResponse(res, progress, 'Progress updated successfully');
  } catch (err) {
    console.error('Update progress error:', err);
    return errorResponse(res, err.message, 500);
  }
});

// POST /api/tasks/classes/:classId — Tạo class task và giao cho sinh viên (teacher)
router.post('/classes/:classId', authenticate, authorizeRoles('teacher'), async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const { title, description, deadline, priority, assignedStudentIds } = req.body;

    if (!title || !title.trim()) {
      return errorResponse(res, 'Task title is required', 400);
    }

    // Kiểm tra quyền teacher
    const cls = await Class.findOne({ where: { id: classId, teacherId: req.user.id } });
    if (!cls) return errorResponse(res, 'Class not found', 404);

    // Tạo class task
    const task = await ClassTask.create({
      classId,
      createdBy: req.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      deadline: deadline || null,
      priority: priority || 'medium',
      assignedTo: JSON.stringify(assignedStudentIds || []),
    });

    // Tạo StudentProgress cho từng sinh viên được giao (mặc định assigned)
    const studentIds = assignedStudentIds || [];
    if (studentIds.length > 0) {
      await Promise.all(
        studentIds.map(sid =>
          StudentProgress.findOrCreate({
            where: { classId, classTaskId: task.id, studentId: sid },
            defaults: { status: 'assigned' },
          })
        )
      );
    }

    return successResponse(res, task, 'Task created and assigned successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;

