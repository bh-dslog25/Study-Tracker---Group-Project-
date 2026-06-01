'use strict';

const { DataType, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: { //username logging
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: { // name in persional profile
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {notEmpty: true, len: [2, 100]},
    }, 
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true},
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [6, 100]},
    },
    create_at: {
        type: DataTypes.DATE,
        
    },
    refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
    },
}, {
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
        if (user.password) {
            user.password = await bcrypt.hash(user.password, 12);
        }
        },
        beforeUpdate: async (user) => {
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 12);
        }
        },
    },
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.refreshToken;
  return values;
};

module.exports = User; 