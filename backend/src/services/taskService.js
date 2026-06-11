'use strict';
const { Task } = require('../models');
const { Op }   = require('sequelize');

const getAll = ({ userId, status, priority, page = 1, limit = 20 }) => {
  const where = { userId };
  if (status)   where.status   = status;
  if (priority) where.priority = priority;
  return Task.findAndCountAll({
    where,
    limit:  parseInt(limit),
    offset: (page - 1) * limit,
    order:  [['priority', 'DESC'], ['dueDate', 'ASC']],
  });
};

const create = (userId, data) => Task.create({ userId, ...data });

const update = async (id, userId, data) => {
  const task = await Task.findOne({ where: { id, userId } });
  if (!task) throw { status: 404, message: 'Không tìm thấy nhiệm vụ' };
  return task.update(data);
};

const remove = async (id, userId) => {
  const task = await Task.findOne({ where: { id, userId } });
  if (!task) throw { status: 404, message: 'Không tìm thấy nhiệm vụ' };
  await task.destroy();
};

module.exports = { getAll, create, update, remove };