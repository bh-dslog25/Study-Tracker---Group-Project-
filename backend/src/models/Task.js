'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Nhiệm vụ cá nhân của student (tự tạo)
const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
    },
    status: {
        type: DataTypes.ENUM('todo', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'todo',
    },
    dueDate:          { type: DataTypes.DATEONLY, allowNull: true },
    completedAt:      { type: DataTypes.DATE, allowNull: true },
    estimatedMinutes: { type: DataTypes.INTEGER, allowNull: true },
    tags:             { type: DataTypes.JSON, defaultValue: [] },
}, {
  tableName: 'tasks',
  hooks: {
    beforeSave: (task) => {
      if (task.changed('status') && task.status === 'completed') {
        task.completedAt = new Date();
      }
    },
  },
});

module.exports = Task;