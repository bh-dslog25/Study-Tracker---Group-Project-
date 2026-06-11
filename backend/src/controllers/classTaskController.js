'use strict';
const classTaskService = require('../services/classTaskService');
const { successResponse, errorResponse } = require('../utils/response');

const create = async (req, res) => {
  try {
    const task = await classTaskService.create(req.user.id, req.params.classId, req.body);
    return successResponse(res, task, 'Tạo nhiệm vụ lớp thành công', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const getByClass = async (req, res) => {
  try {
    const tasks = await classTaskService.getByClass(req.params.classId, req.user.id, req.user.role);
    return successResponse(res, tasks, 'Lấy danh sách nhiệm vụ thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const update = async (req, res) => {
  try {
    const task = await classTaskService.update(req.params.taskId, req.user.id, req.body);
    return successResponse(res, task, 'Cập nhật nhiệm vụ thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const remove = async (req, res) => {
  try {
    await classTaskService.remove(req.params.taskId, req.user.id);
    return successResponse(res, null, 'Xoá nhiệm vụ thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = { create, getByClass, update, remove };