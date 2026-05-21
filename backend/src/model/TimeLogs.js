'use strict'

const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database')

const TimeLog = sequelize.define('TimeLog', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },

    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {model: 'User', key: 'id'},
    },

    taskId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {model: 'Task', key: 'id'},
    },

    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    endTime: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    durationMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});