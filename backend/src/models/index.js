'use strict';

const User = require('./User');
const Goal = require('./Goal');
const Task = require('./Task');
const TimeLog = require('./TimeLogs');

const { sequelize } = require('../config/database');

// Associations
User.hasMany(Goal, { foreignKey: 'userId', as: 'goals' });
Goal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Goal.hasMany(Task, { foreignKey: 'goal_id', as: 'tasks' });
Task.belongsTo(Goal, { foreignKey: 'goal_id', as: 'goal' });

User.hasMany(TimeLog, { foreignKey: 'userId', as: 'timeLogs' });
TimeLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Task.hasMany(TimeLog, { foreignKey: 'taskId', as: 'timeLogs' });
TimeLog.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

module.exports = {
  sequelize,
  User,
  Goal,
  Task,
  TimeLog,
};
