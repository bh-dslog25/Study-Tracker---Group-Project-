'use strict';
const progressService = require('../services/progressService');
const { successResponse, errorResponse } = require('../utils/response');

// TEACHER: xem toàn bộ tiến độ lớp
const getClassProgress = async (req, res) => {
  try {
    const data = await progressService.getClassProgress(req.params.classId, req.user.id);
    return successResponse(res, data, 'Lấy tiến độ lớp thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

// TEACHER: xem tiến độ 1 học viên
const getStudentProgress = async (req, res) => {
  try {
    const data = await progressService.getStudentProgress(req.params.classId, req.params.studentId, req.user.id);
    return successResponse(res, data, 'Lấy tiến độ học viên thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

// STUDENT: xem tiến độ bản thân
const getMyProgress = async (req, res) => {
  try {
    const data = await progressService.getMyProgress(req.params.classId, req.user.id);
    return successResponse(res, data, 'Lấy tiến độ của bạn thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

// STUDENT: cập nhật trạng thái nhiệm vụ
const updateMyProgress = async (req, res) => {
  try {
    const data = await progressService.updateMyProgress(req.params.progressId, req.user.id, req.body.status);
    return successResponse(res, data, 'Cập nhật tiến độ thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = { getClassProgress, getStudentProgress, getMyProgress, updateMyProgress };