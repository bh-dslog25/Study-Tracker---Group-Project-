'use strict';
const classService = require('../services/classService');
const { successResponse, errorResponse } = require('../utils/response');

// ===== TEACHER =====
const createClass = async (req, res) => {
  try {
    const cls = await classService.createClass(req.user.id, req.body);
    return successResponse(res, cls, 'Tạo lớp học thành công', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const getMyClasses = async (req, res) => {
  try {
    const classes = await classService.getMyClasses(req.user.id);
    return successResponse(res, classes, 'Lấy danh sách lớp thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const getClassDetail = async (req, res) => {
  try {
    const cls = await classService.getClassDetail(req.params.id, req.user.id);
    return successResponse(res, cls, 'Lấy chi tiết lớp thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const updateClass = async (req, res) => {
  try {
    const cls = await classService.updateClass(req.params.id, req.user.id, req.body);
    return successResponse(res, cls, 'Cập nhật lớp thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const deleteClass = async (req, res) => {
  try {
    await classService.deleteClass(req.params.id, req.user.id);
    return successResponse(res, null, 'Xoá lớp thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const removeStudent = async (req, res) => {
  try {
    await classService.removeStudent(req.params.id, req.user.id, req.params.studentId);
    return successResponse(res, null, 'Đã xoá học viên khỏi lớp');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

// ===== STUDENT =====
const joinClass = async (req, res) => {
  try {
    const member = await classService.joinClass(req.user.id, req.body.inviteCode);
    return successResponse(res, member, 'Tham gia lớp thành công', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const getJoinedClasses = async (req, res) => {
  try {
    const classes = await classService.getJoinedClasses(req.user.id);
    return successResponse(res, classes, 'Lấy danh sách lớp thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const leaveClass = async (req, res) => {
  try {
    await classService.leaveClass(req.user.id, req.params.id);
    return successResponse(res, null, 'Rời lớp thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = {
  createClass, getMyClasses, getClassDetail, updateClass, deleteClass, removeStudent,
  joinClass, getJoinedClasses, leaveClass,
};