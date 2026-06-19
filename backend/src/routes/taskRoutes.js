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

    // Tìm các class task mà student được giao
    const assignments = await ClassTask.findAll({
      where: {
        assignedTo: { [Op.ne]: null },
      },
      include: [{
        model: Class,
        as: 'class',
        where: {
          id: {
            [Op.in]: [
              require('../models').ClassMember.findAll({
                where: { studentId, status: 'active' },
                attributes: ['classId'],
              })
            ]
          }
        },
        attributes: ['id', 'name'],
      }],
      attributes: ['id', 'classId', 'title', 'description', 'deadline', 'priority', 'assignedTo'],
      order: [['createdAt', 'DESC']],
    });

    // Lọc那些 assignedTo bao gồm studentId
    const myTasks = assignments
      .filter(task => {
        const ids = JSON.parse(task.assignedTo || '[]');
        return ids.includes(studentId);
      })
      .map(task => ({
        ...task.toJSON(),
        isDone: false, // TODO: kiểm tra StudentProgress nếu cần
      }));

    return successResponse(res, myTasks, 'Get assigned tasks successfully');
  } catch (err) {
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

