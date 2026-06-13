'use strict';
const { TimeLog, Goal } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const getAll = ({ userId, status, from, to, page = 1, limit = 20 }) => {
  const where = { userId };
  if (status) where.status = status;
  if (from || to) {
    where.startTime = {};
    if (from) where.startTime[Op.gte] = new Date(from);
    if (to)   where.startTime[Op.lte] = new Date(to);
  }
  return TimeLog.findAndCountAll({
    where,
    limit:  parseInt(limit),
    offset: (page - 1) * limit,
    order:  [['startTime', 'DESC']],
  });
};

const start = async (userId, data) => {
  const ongoing = await TimeLog.findOne({ where: { userId, status: 'ongoing' } });
  if (ongoing) throw { status: 409, message: 'Bạn đang có phiên học chưa kết thúc' };
  return TimeLog.create({ userId, ...data, startTime: new Date(), status: 'ongoing' });
};

const stop = async (id, userId, data) => {
  const log = await TimeLog.findOne({ where: { id, userId } });
  if (!log) throw { status: 404, message: 'Không tìm thấy phiên học' };
  if (log.status !== 'ongoing') throw { status: 400, message: 'Phiên học đã kết thúc' };
  const endTime = new Date();
  const updatedLog = await log.update({ endTime, status: 'completed', ...data });

  if (updatedLog.durationMinutes) {
    const hours = Number((updatedLog.durationMinutes / 60).toFixed(2));
    await Goal.increment({ achievedHours: hours }, {
      where: {
        userId,
        status: 'active',
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
      },
    });

    await Goal.update({ status: 'completed' }, {
      where: {
        userId,
        status: 'active',
        achievedHours: { [Op.gte]: sequelize.col('targetHours') },
      },
    });

    await Goal.update({ status: 'failed' }, {
      where: {
        userId,
        status: 'active',
        endDate: { [Op.lt]: new Date() },
        achievedHours: { [Op.lt]: sequelize.col('targetHours') },
      },
    });
  }

  return updatedLog;
};

const getStats = async (userId, { from, to }) => {
  const where = { userId, status: 'completed' };
  if (from || to) {
    where.startTime = {};
    if (from) where.startTime[Op.gte] = new Date(from);
    if (to)   where.startTime[Op.lte] = new Date(to);
  }

  const [total, byDay] = await Promise.all([
    TimeLog.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
        [sequelize.fn('SUM',   sequelize.col('durationMinutes')), 'totalMinutes'],
        [sequelize.fn('AVG',   sequelize.col('durationMinutes')), 'avgMinutes'],
      ],
      raw: true,
    }),
    TimeLog.findAll({
      where: { ...where, startTime: { [Op.gte]: new Date(Date.now() - 7 * 86400000) } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('startTime')), 'date'],
        [sequelize.fn('SUM',  sequelize.col('durationMinutes')), 'totalMinutes'],
        [sequelize.fn('COUNT',sequelize.col('id')), 'sessions'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('startTime'))],
      order: [[sequelize.fn('DATE', sequelize.col('startTime')), 'ASC']],
      raw: true,
    }),
  ]);

  return { total, byDay };
};

const remove = async (id, userId) => {
  const log = await TimeLog.findOne({ where: { id, userId } });
  if (!log) throw { status: 404, message: 'Không tìm thấy phiên học' };
  await log.destroy();
};

module.exports = { getAll, start, stop, getStats, remove };