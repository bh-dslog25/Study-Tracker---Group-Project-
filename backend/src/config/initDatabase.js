'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DATABASE_USER = process.env.DB_USER || process.env.DATABASE_USER || 'root';
const DATABASE_PASSWORD = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || 'Pubg.ak47';
const DATABASE_HOST = process.env.DB_HOST || process.env.DATABASE_HOST || '127.0.0.1';
const DATABASE_PORT = Number(process.env.DB_PORT || process.env.DATABASE_PORT || 3306);

const schemaPath = path.join(__dirname, '../../database/schema.sql');

const initDatabase = async () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    console.log('Database schema initialized successfully.');
  } finally {
    await connection.end();
  }
};

initDatabase().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
});
