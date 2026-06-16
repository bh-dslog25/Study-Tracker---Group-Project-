'use strict';
const { Goal, Task } = require('../models');
const { Op } = require('sequelize');

const includeTasks = {
  model: Task,
  as: 'goalTasks',
  attributes: ['id', 'title', 'status', 'priority', 'dueDate', 'completedAt', 'estimatedMinutes'],
};

const transformGoal = (goal) => {
  const plain = goal.toJSON();
  plain.tasks = (plain.goalTasks || []).map(t => ({
    ...t,
    completed: t.status === 'completed',
  }));
  delete plain.goalTasks;
  plain.completedTasks = plain.tasks.filter(t => t.completed).length;
  plain.totalTasks = plain.tasks.length;
  return plain;
};

const getAll = async ({ userId, status, type, page = 1, limit = 20 }) => {
  const where = { userId };
  if (status) where.status = status;
  if (type) where.type = type;

  try {
    const result = await Goal.findAndCountAll({
      where,
      include: [includeTasks],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['endDate', 'ASC']],
      subQuery: false,
    });

    const rows = result.rows.map(transformGoal);
    return { count: result.count, rows };
  } catch (includeErr) {
    console.error('getAll with include failed, falling back:', includeErr.message);
    // Fallback: query without include tasks
    const result = await Goal.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['endDate', 'ASC']],
    });

    const rows = result.rows.map(goal => {
      const plain = goal.toJSON();
      plain.tasks = [];
      plain.completedTasks = 0;
      plain.totalTasks = 0;
      return plain;
    });

    return { count: result.count, rows };
  }
};

const getById = async (id, userId) => {
  try {
    const goal = await Goal.findOne({
      where: { id, userId },
      include: [includeTasks],
    });
    if (!goal) return null;
    return transformGoal(goal);
  } catch (err) {
    console.error('getById with include failed, falling back:', err.message);
    const goal = await Goal.findOne({ where: { id, userId } });
    if (!goal) return null;
    const plain = goal.toJSON();
    plain.tasks = [];
    plain.completedTasks = 0;
    plain.totalTasks = 0;
    return plain;
  }
};

const create = (userId, data) => Goal.create({ userId, ...data });

const update = async (id, userId, data) => {
  const goal = await Goal.findOne({ where: { id, userId } });
  if (!goal) throw { status: 404, message: 'Không tìm thấy mục tiêu' };
  return goal.update(data);
};

const remove = async (id, userId) => {
  const goal = await Goal.findOne({ where: { id, userId } });
  if (!goal) throw { status: 404, message: 'Không tìm thấy mục tiêu' };
  await goal.destroy();
};

// ===== TASK MANAGEMENT INSIDE GOAL =====

const addGoalTask = async (goalId, userId, taskData) => {
  const goal = await Goal.findOne({ where: { id: goalId, userId } });
  if (!goal) throw { status: 404, message: 'Không tìm thấy mục tiêu' };

  const task = await Task.create({
    userId,
    goalId,
    title: taskData.title,
    description: taskData.description || null,
    priority: taskData.priority || 'medium',
    dueDate: taskData.dueDate || null,
    estimatedMinutes: taskData.estimatedMinutes || null,
    status: 'todo',
  });

  const plain = task.toJSON();
  plain.completed = plain.status === 'completed';
  return plain;
};

const toggleGoalTask = async (goalId, taskId, userId) => {
  const goal = await Goal.findOne({ where: { id: goalId, userId } });
  if (!goal) throw { status: 404, message: 'Không tìm thấy mục tiêu' };

  const task = await Task.findOne({ where: { id: taskId, goalId, userId } });
  if (!task) throw { status: 404, message: 'Không tìm thấy nhiệm vụ' };

  const newStatus = task.status === 'completed' ? 'todo' : 'completed';
  await task.update({
    status: newStatus,
    completedAt: newStatus === 'completed' ? new Date() : null,
  });

  // Update goal achievedHours based on task completion
  const allTasks = await Task.findAll({ where: { goalId } });
  const completedCount = allTasks.filter(t => t.status === 'completed').length;
  const totalCount = allTasks.length;

  const newAchieved = totalCount > 0
    ? Math.round((completedCount / totalCount) * Number(goal.targetHours) * 10) / 10
    : 0;

  await goal.update({ achievedHours: newAchieved });

  const plain = task.toJSON();
  plain.completed = plain.status === 'completed';
  return plain;
};

const removeGoalTask = async (goalId, taskId, userId) => {
  const goal = await Goal.findOne({ where: { id: goalId, userId } });
  if (!goal) throw { status: 404, message: 'Không tìm thấy mục tiêu' };

  const task = await Task.findOne({ where: { id: taskId, goalId, userId } });
  if (!task) throw { status: 404, message: 'Không tìm thấy nhiệm vụ' };

  await task.destroy();

  // Recalculate goal achievedHours after deletion
  const allTasks = await Task.findAll({ where: { goalId } });
  const completedCount = allTasks.filter(t => t.status === 'completed').length;
  const totalCount = allTasks.length;

  const newAchieved = totalCount > 0
    ? Math.round((completedCount / totalCount) * Number(goal.targetHours) * 10) / 10
    : 0;

  await goal.update({ achievedHours: newAchieved });
};

module.exports = { getAll, getById, create, update, remove, addGoalTask, toggleGoalTask, removeGoalTask };