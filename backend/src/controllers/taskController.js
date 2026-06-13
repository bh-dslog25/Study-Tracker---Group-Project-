'use strict';
const taskService = require('../services/taskService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAll = async (req, res) => {
  try {
    const { count, rows } = await taskService.getAll({ userId: req.user.id, ...req.query });
    return paginatedResponse(res, rows, count, req.query.page || 1, req.query.limit || 20, 'Lấy danh sách nhiệm vụ thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const create = async (req, res) => {
  try {
    const task = await taskService.create(req.user.id, req.body);
    return successResponse(res, task, 'Tạo nhiệm vụ thành công', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const update = async (req, res) => {
  try {
    const task = await taskService.update(req.params.id, req.user.id, req.body);
    return successResponse(res, task, 'Cập nhật nhiệm vụ thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const remove = async (req, res) => {
  try {
    await taskService.remove(req.params.id, req.user.id);
    return successResponse(res, null, 'Xoá nhiệm vụ thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = { getAll, create, update, remove };