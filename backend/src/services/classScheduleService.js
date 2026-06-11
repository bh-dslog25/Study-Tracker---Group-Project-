'use strict';
const { ClassSchedule, Class, ClassMember } = require('../models');
const { Op } = require('sequelize');

const create = async (teacherId, classId, data) => {
  const cls = await Class.findOne({ where: { id: classId, teacherId } });
  if (!cls) throw { status: 403, message: 'Bạn không phải giáo viên lớp này' };
  return ClassSchedule.create({ classId, createdBy: teacherId, ...data });
};

const getByClass = async (classId, requesterId, role) => {
  if (role === 'teacher') {
    const cls = await Class.findOne({ where: { id: classId, teacherId: requesterId } });
    if (!cls) throw { status: 403, message: 'Bạn không phải giáo viên lớp này' };
  } else {
    const member = await ClassMember.findOne({ where: { classId, studentId: requesterId, status: 'active' } });
    if (!member) throw { status: 403, message: 'Bạn không thuộc lớp này' };
  }
  return ClassSchedule.findAll({
    where: { classId },
    order: [['startTime', 'ASC']],
  });
};

const update = async (scheduleId, teacherId, data) => {
  const schedule = await ClassSchedule.findOne({ where: { id: scheduleId, createdBy: teacherId } });
  if (!schedule) throw { status: 404, message: 'Không tìm thấy lịch học' };
  return schedule.update(data);
};

const remove = async (scheduleId, teacherId) => {
  const schedule = await ClassSchedule.findOne({ where: { id: scheduleId, createdBy: teacherId } });
  if (!schedule) throw { status: 404, message: 'Không tìm thấy lịch học' };
  await schedule.destroy();
};

module.exports = { create, getByClass, update, remove };