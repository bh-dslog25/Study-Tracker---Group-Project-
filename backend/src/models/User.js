'use strict';
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 100] },
        field: 'username',
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    password:     { type: DataTypes.STRING(255), allowNull: false },
    role: {
        type: DataTypes.ENUM('student', 'teacher'),
        defaultValue: 'student',
        allowNull: false,
    },
    isActive:     { type: DataTypes.BOOLEAN, defaultValue: true },
    lastLogin:    { type: DataTypes.DATE, allowNull: true },
    refreshToken: { type: DataTypes.TEXT, allowNull: true },
}, {
tableName: 'users', 
hooks: {
    beforeCreate: async (user) => { user.password = await bcrypt.hash(user.password, 12); },
    beforeUpdate: async (user) => { if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12); },
    },
});

User.prototype.comparePassword = function (plain) {
    return require('bcryptjs').compare(plain, this.password);
};

User.prototype.toJSON = function () {
    const v = { ...this.get() };
    delete v.password;
    delete v.refreshToken;
    return v;
};

module.exports = User;