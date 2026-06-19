'use strict';
const router = require('express').Router();
const { Class } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const crypto = require('crypto');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { User, ClassMember } = require('../models');
const { emitNewJoinRequest } = require('../utils/socket');
const authenticate = require('../middleware/authMiddleware');

// POST /api/classes — Create a new class
router.post('/', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return errorResponse(res, 'Class name is required', 400);
    }

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const cls = await Class.create({
      teacherId: req.user.id,
      name: name.trim(),
      inviteCode,
    });

    return successResponse(res, cls, 'Class created successfully', 201);
  } catch (err) {
    console.error('Create class error:', err);
    return errorResponse(res, err.message || 'Failed to create class', 500);
  }
});

// GET /api/classes — Get all classes (placeholder)
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Class routes OK' });
});

// ===== THAM GIA LỚP THEO INVITE CODE (Student) - Gửi yêu cầu chờ duyệt =====
router.post('/join', authenticate, authorizeRoles('student', 'teacher'), async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || !inviteCode.trim()) {
      return errorResponse(res, 'Please enter inviteCode', 400);
    }

    const cls = await Class.findOne({
      where: { inviteCode: inviteCode.trim().toUpperCase(), isActive: true },
    });

    if (!cls) return errorResponse(res, 'Class not found for this inviteCode', 404);

    const studentId = req.user.id;

    const existing = await ClassMember.findOne({ where: { classId: cls.id, studentId } });
    if (existing) {
      if (existing.status === 'active') {
        return errorResponse(res, 'Student is already in this class', 409);
      }
      if (existing.status === 'pending') {
        return errorResponse(res, 'Join request is pending approval', 400);
      }
      // inactive → resend request
      await existing.update({ status: 'pending', joinedAt: null });
      return successResponse(res, { classId: cls.id, studentId }, 'Join request sent successfully');
    }

    const member = await ClassMember.create({ classId: cls.id, studentId, status: 'pending' });
    // Notify teachers via socket
    emitNewJoinRequest({
      id: member.id,
      classId: cls.id,
      className: cls.name,
      classInviteCode: cls.inviteCode,
      studentId,
      studentName: req.user?.username,
      studentEmail: req.user?.email,
      requestedAt: new Date(),
    });
    return successResponse(res, { classId: cls.id, studentId }, 'Join request sent successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
