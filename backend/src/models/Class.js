'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Lớp học do giáo viên tạo
const Class = sequelize.define('Class', {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    teacherId:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name:        { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    inviteCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
    },
    isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
    maxStudents: { type: DataTypes.INTEGER, defaultValue: 50 },
}, { tableName: 'classes' });

module.exports = Class;