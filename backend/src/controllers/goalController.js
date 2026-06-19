'use strict';
const goalService = require('../services/goalService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAll = async (req, res) => {
  try {
    const { count, rows } = await goalService.getAll({ userId: req.user.id, ...req.query });
    return paginatedResponse(res, rows, count, req.query.page || 1, req.query.limit || 20, 'Get goals list successfully');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const getById = async (req, res) => {
  try {
    const goal = await goalService.getById(req.params.id, req.user.id);
    if (!goal) return errorResponse(res, 'Goal not found', 404);
    return successResponse(res, goal, 'Get goal successfully');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const create = async (req, res) => {
  try {
    const goal = await goalService.create(req.user.id, req.body);
    return successResponse(res, goal, 'Create goal successfully', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const update = async (req, res) => {
  try {
    const goal = await goalService.update(req.params.id, req.user.id, req.body);
    return successResponse(res, goal, 'Update goal successfully');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const remove = async (req, res) => {
  try {
    await goalService.remove(req.params.id, req.user.id);
    return successResponse(res, null, 'Delete goal successfully');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

// ===== TASK MANAGEMENT INSIDE GOAL =====

const addTask = async (req, res) => {
  try {
    console.log('addTask - params:', req.params, 'body:', req.body, 'user:', req.user.id);
    const task = await goalService.addGoalTask(req.params.id, req.user.id, req.body);
    return successResponse(res, task, 'Add task to goal successfully', 201);
  } catch (err) {
    console.error('addTask FULL ERROR:', err);
    console.error('addTask STACK:', err.stack);
    return errorResponse(res, err.message || 'Unknown error', err.status || 500);
  }
};

const toggleTask = async (req, res) => {
  try {
    const task = await goalService.toggleGoalTask(req.params.id, req.params.taskId, req.user.id);
    return successResponse(res, task, 'Update task status successfully');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const removeTask = async (req, res) => {
  try {
    await goalService.removeGoalTask(req.params.id, req.params.taskId, req.user.id);
    return successResponse(res, null, 'Delete task from goal successfully');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = { getAll, getById, create, update, remove, addTask, toggleTask, removeTask };