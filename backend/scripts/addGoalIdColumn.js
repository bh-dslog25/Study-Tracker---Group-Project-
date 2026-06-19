const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check if goalId column exists
    const columns = await sequelize.query(
      "SHOW COLUMNS FROM tasks LIKE 'goalId'",
      { type: QueryTypes.SELECT }
    );

    if (columns.length === 0) {
      await sequelize.query(
        "ALTER TABLE tasks ADD COLUMN goalId INT UNSIGNED NULL DEFAULT NULL AFTER userId"
      );
      console.log('Column goalId added to tasks table successfully!');
    } else {
      console.log('Column goalId already exists in tasks table.');
    }

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();