'use strict';

const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Task = sequelize.define('Task',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: 'User', key: 'id'},
    },
    goal_id: {
        type: DataTypes.INTEGER,
        references: {model: 'Goal', key: 'id'},
    },
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    decription: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: { //trang thai tien do cua nhiem vu
        type: DataTypes.ENUM('todo', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'todo',
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    estimatedMinutes: { // thoi gian setup cua nhiem vu
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1 },
    },
    recurringDays: { // task lặp lại định kì khi nào
        type: DataTypes.JSON,
        defaultValue: [],
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: [],
    },

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