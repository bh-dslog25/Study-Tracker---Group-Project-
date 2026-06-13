'use strict';
const { Goal } = require('../models');
const { Op }   = require('sequelize');

const getAll = ({ userId, status, type, page = 1, limit = 20 }) => {
  const where = { userId };
  if (status) where.status = status;
  if (type)   where.type   = type;
  return Goal.findAndCountAll({
    where,
    limit:  parseInt(limit),
    offset: (page - 1) * limit,
    order:  [['endDate', 'ASC']],
  });
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

module.exports = { getAll, create, update, remove };