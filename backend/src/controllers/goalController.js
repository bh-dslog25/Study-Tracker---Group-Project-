'use strict';
const goalService = require('../services/goalService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAll = async (req, res) => {
  try {
    const { count, rows } = await goalService.getAll({ userId: req.user.id, ...req.query });
    return paginatedResponse(res, rows, count, req.query.page || 1, req.query.limit || 20, 'Lấy danh sách mục tiêu thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const create = async (req, res) => {
  try {
    const goal = await goalService.create(req.user.id, req.body);
    return successResponse(res, goal, 'Tạo mục tiêu thành công', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const update = async (req, res) => {
  try {
    const goal = await goalService.update(req.params.id, req.user.id, req.body);
    return successResponse(res, goal, 'Cập nhật mục tiêu thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const remove = async (req, res) => {
  try {
    await goalService.remove(req.params.id, req.user.id);
    return successResponse(res, null, 'Xoá mục tiêu thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = { getAll, create, update, remove };