const dotenv = require('dotenv');
const path = require('path');
const { Sequelize } = require('sequelize');

dotenv.config({ path: path.join(__dirname, '../.env') });

const DATABASE_NAME = process.env.DB_NAME || process.env.DATABASE_NAME || 'study_tracker';
const DATABASE_USER = process.env.DB_USER || process.env.DATABASE_USER || 'root';
const DATABASE_PASSWORD = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || 'Pubg.ak47';
const DATABASE_HOST = process.env.DB_HOST || process.env.DATABASE_HOST || '127.0.0.1';
const DATABASE_PORT = Number(process.env.DB_PORT || process.env.DATABASE_PORT || 3306);
const DATABASE_DIALECT = process.env.DB_DIALECT || process.env.DATABASE_DIALECT || 'mysql';

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  dialect: DATABASE_DIALECT,
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
