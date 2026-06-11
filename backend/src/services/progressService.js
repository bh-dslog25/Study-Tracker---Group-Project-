'use strict';
const { StudentProgress, Class, ClassMember, User, ClassTask } = require('../models');

// ===== TEACHER: xem tiến độ toàn lớp =====
const getClassProgress = async (classId, teacherId) => {
  const cls = await Class.findOne({ where: { id: classId, teacherId } });
  if (!cls) throw { status: 403, message: 'Bạn không phải giáo viên lớp này' };

  return StudentProgress.findAll({
    where: { classId },
    include: [
      { model: User,      as: 'student',   attributes: ['id', 'name', 'email'] },
      { model: ClassTask, as: 'classTask',  attributes: ['id', 'title', 'dueDate', 'priority'] },
    ],
    order: [['classTaskId', 'ASC'], ['studentId', 'ASC']],
  });
};

// ===== TEACHER: xem tiến độ 1 học viên =====
const getStudentProgress = async (classId, studentId, teacherId) => {
  const cls = await Class.findOne({ where: { id: classId, teacherId } });
  if (!cls) throw { status: 403, message: 'Bạn không phải giáo viên lớp này' };

  return StudentProgress.findAll({
    where: { classId, studentId },
    include: [{ model: ClassTask, as: 'classTask', attributes: ['id', 'title', 'dueDate', 'priority'] }],
    order: [['classTaskId', 'ASC']],
  });
};

// ===== STUDENT: xem tiến độ của bản thân trong lớp =====
const getMyProgress = async (classId, studentId) => {
  const member = await ClassMember.findOne({ where: { classId, studentId, status: 'active' } });
  if (!member) throw { status: 403, message: 'Bạn không thuộc lớp này' };

  return StudentProgress.findAll({
    where: { classId, studentId },
    include: [{ model: ClassTask, as: 'classTask', attributes: ['id', 'title', 'dueDate', 'priority'] }],
    order: [['classTaskId', 'ASC']],
  });
};

// ===== STUDENT: cập nhật trạng thái nhiệm vụ của mình =====
const updateMyProgress = async (progressId, studentId, status) => {
  const progress = await StudentProgress.findOne({ where: { id: progressId, studentId } });
  if (!progress) throw { status: 404, message: 'Không tìm thấy tiến độ' };
  return progress.update({ status });
};

module.exports = { getClassProgress, getStudentProgress, getMyProgress, updateMyProgress };
