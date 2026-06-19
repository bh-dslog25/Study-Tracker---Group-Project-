'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassMember = sequelize.define('ClassMember', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  classId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive', 'pending'), allowNull: false, defaultValue: 'active' },
  joinedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'class_members',
});

module.exports = ClassMember;

