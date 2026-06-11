'use strict';
const { ClassTask, Class, StudentProgress, ClassMember, User } = require('../models');

// ===== TEACHER =====

const create = async (teacherId, classId, data) => {
  const cls = await Class.findOne({ where: { id: classId, teacherId } });
  if (!cls) throw { status: 403, message: 'Bạn không phải giáo viên lớp này' };

  const task = await ClassTask.create({ classId, createdBy: teacherId, ...data });

  // Tự động tạo StudentProgress cho tất cả học viên trong lớp
  const members = await ClassMember.findAll({ where: { classId, status: 'active' } });
  const progresses = members.map((m) => ({
    classId,
    classTaskId: task.id,
    studentId:   m.studentId,
    status:      'assigned',
  }));
  if (progresses.length > 0) await StudentProgress.bulkCreate(progresses);

  return task;
};

const getByClass = async (classId, requesterId, role) => {
  // Teacher phải sở hữu lớp, Student phải là thành viên
  if (role === 'teacher') {
    const cls = await Class.findOne({ where: { id: classId, teacherId: requesterId } });
    if (!cls) throw { status: 403, message: 'Bạn không phải giáo viên lớp này' };
  } else {
    const member = await ClassMember.findOne({ where: { classId, studentId: requesterId, status: 'active' } });
    if (!member) throw { status: 403, message: 'Bạn không thuộc lớp này' };
  }
  return ClassTask.findAll({ where: { classId }, order: [['dueDate', 'ASC']] });
};

const update = async (taskId, teacherId, data) => {
  const task = await ClassTask.findOne({ where: { id: taskId, createdBy: teacherId } });
  if (!task) throw { status: 404, message: 'Không tìm thấy nhiệm vụ hoặc bạn không có quyền' };
  return task.update(data);
};

const remove = async (taskId, teacherId) => {
  const task = await ClassTask.findOne({ where: { id: taskId, createdBy: teacherId } });
  if (!task) throw { status: 404, message: 'Không tìm thấy nhiệm vụ' };
  await task.destroy();
};

module.exports = { create, getByClass, update, remove };