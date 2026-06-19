'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentProgress = sequelize.define('StudentProgress', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  classId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  classTaskId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status: { type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'late'), allowNull: false, defaultValue: 'assigned' },
}, {
  tableName: 'student_progresses',
});

module.exports = StudentProgress;

