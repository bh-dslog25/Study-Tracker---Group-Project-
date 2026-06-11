'use strict';
const { Class, ClassMember, User } = require('../models');
const { Op } = require('sequelize');

// Sinh mã mời ngẫu nhiên 6 ký tự
const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// ===== TEACHER =====

const createClass = async (teacherId, data) => {
  let inviteCode;
  let exists = true;
  // Đảm bảo mã không trùng
  while (exists) {
    inviteCode = generateInviteCode();
    exists = !!(await Class.findOne({ where: { inviteCode } }));
  }
  return Class.create({ teacherId, ...data, inviteCode });
};

const getMyClasses = (teacherId) =>
  Class.findAll({
    where: { teacherId },
    include: [{ model: ClassMember, as: 'members', where: { status: 'active' }, required: false }],
    order: [['createdAt', 'DESC']],
  });

const getClassDetail = async (classId, teacherId) => {
  const cls = await Class.findOne({
    where: { id: classId, teacherId },
    include: [
      {
        model: ClassMember, as: 'members', where: { status: 'active' }, required: false,
        include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
      },
    ],
  });
  if (!cls) throw { status: 404, message: 'Không tìm thấy lớp học' };
  return cls;
};

const updateClass = async (classId, teacherId, data) => {
  const cls = await Class.findOne({ where: { id: classId, teacherId } });
  if (!cls) throw { status: 404, message: 'Không tìm thấy lớp học' };
  return cls.update(data);
};

const deleteClass = async (classId, teacherId) => {
  const cls = await Class.findOne({ where: { id: classId, teacherId } });
  if (!cls) throw { status: 404, message: 'Không tìm thấy lớp học' };
  await cls.destroy();
};

const removeStudent = async (classId, teacherId, studentId) => {
  const cls = await Class.findOne({ where: { id: classId, teacherId } });
  if (!cls) throw { status: 404, message: 'Không tìm thấy lớp học' };

  const member = await ClassMember.findOne({ where: { classId, studentId, status: 'active' } });
  if (!member) throw { status: 404, message: 'Học viên không thuộc lớp này' };
  await member.update({ status: 'removed' });
};

// ===== STUDENT =====

const joinClass = async (studentId, inviteCode) => {
  const cls = await Class.findOne({ where: { inviteCode, isActive: true } });
  if (!cls) throw { status: 404, message: 'Mã lớp không hợp lệ hoặc lớp đã đóng' };

  const already = await ClassMember.findOne({ where: { classId: cls.id, studentId } });
  if (already) {
    if (already.status === 'active') throw { status: 409, message: 'Bạn đã tham gia lớp này rồi' };
    return already.update({ status: 'active' }); // re-join nếu bị xoá trước đó
  }

  // Kiểm tra giới hạn học viên
  const count = await ClassMember.count({ where: { classId: cls.id, status: 'active' } });
  if (count >= cls.maxStudents) throw { status: 400, message: 'Lớp học đã đầy' };

  return ClassMember.create({ classId: cls.id, studentId });
};

const getJoinedClasses = (studentId) =>
  Class.findAll({
    include: [{
      model: ClassMember, as: 'members',
      where: { studentId, status: 'active' },
      required: true,
    }, {
      model: User, as: 'teacher', attributes: ['id', 'name', 'email'],
    }],
    order: [['createdAt', 'DESC']],
  });

const leaveClass = async (studentId, classId) => {
  const member = await ClassMember.findOne({ where: { classId, studentId, status: 'active' } });
  if (!member) throw { status: 404, message: 'Bạn không thuộc lớp này' };
  await member.update({ status: 'removed' });
};

module.exports = {
  createClass, getMyClasses, getClassDetail, updateClass, deleteClass, removeStudent,
  joinClass, getJoinedClasses, leaveClass,
};
