'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
 
// Lịch học do giáo viên tạo cho lớp
const ClassSchedule = sequelize.define('ClassSchedule', {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    classId:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    createdBy:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title:       { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    startTime:   { type: DataTypes.DATE, allowNull: false },
    endTime:     { type: DataTypes.DATE, allowNull: false },
    location:    { type: DataTypes.STRING(200), allowNull: true },
    meetingUrl:  { type: DataTypes.STRING(500), allowNull: true },
    type: {
        type: DataTypes.ENUM('lesson', 'exam', 'review', 'other'),
        defaultValue: 'lesson',
    },
}, { tableName: 'class_schedules' });
 
module.exports = ClassSchedule;