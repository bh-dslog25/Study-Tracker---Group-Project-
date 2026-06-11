'use strict';
const classScheduleService = require('../services/classScheduleService');
const { successResponse, errorResponse } = require('../utils/response');

const create = async (req, res) => {
  try {
    const schedule = await classScheduleService.create(req.user.id, req.params.classId, req.body);
    return successResponse(res, schedule, 'Tạo lịch học thành công', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const getByClass = async (req, res) => {
  try {
    const schedules = await classScheduleService.getByClass(req.params.classId, req.user.id, req.user.role);
    return successResponse(res, schedules, 'Lấy danh sách lịch học thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const update = async (req, res) => {
  try {
    const schedule = await classScheduleService.update(req.params.scheduleId, req.user.id, req.body);
    return successResponse(res, schedule, 'Cập nhật lịch học thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const remove = async (req, res) => {
  try {
    await classScheduleService.remove(req.params.scheduleId, req.user.id);
    return successResponse(res, null, 'Xoá lịch học thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = { create, getByClass, update, remove };