'use strict';
const { Sequelize } = require('sequelize');

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_NAME = 'study_tracker',
  DB_USER = 'root',
  DB_PASS = '',
  DB_DIALECT = 'mysql',
} = process.env;

// Single Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: DB_DIALECT,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Optionally ensure models are in sync if you want:
    // await sequelize.sync();
    return sequelize;
  } catch (err) {
    throw err;
  }
};

module.exports = { sequelize, connectDB };

