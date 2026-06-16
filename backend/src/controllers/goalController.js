'use strict';
const goalService = require('../services/goalService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAll = async (req, res) => {
  try {
    const { count, rows } = await goalService.getAll({ userId: req.user.id, ...req.query });
    return paginatedResponse(res, rows, count, req.query.page || 1, req.query.limit || 20, 'Lấy danh sách mục tiêu thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const getById = async (req, res) => {
  try {
    const goal = await goalService.getById(req.params.id, req.user.id);
    if (!goal) return errorResponse(res, 'Không tìm thấy mục tiêu', 404);
    return successResponse(res, goal, 'Lấy mục tiêu thành công');
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

// ===== TASK MANAGEMENT INSIDE GOAL =====

const addTask = async (req, res) => {
  try {
    const task = await goalService.addGoalTask(req.params.id, req.user.id, req.body);
    return successResponse(res, task, 'Thêm nhiệm vụ vào mục tiêu thành công', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const toggleTask = async (req, res) => {
  try {
    const task = await goalService.toggleGoalTask(req.params.id, req.params.taskId, req.user.id);
    return successResponse(res, task, 'Cập nhật trạng thái nhiệm vụ thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const removeTask = async (req, res) => {
  try {
    await goalService.removeGoalTask(req.params.id, req.params.taskId, req.user.id);
    return successResponse(res, null, 'Xoá nhiệm vụ khỏi mục tiêu thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = { getAll, getById, create, update, remove, addTask, toggleTask, removeTask };