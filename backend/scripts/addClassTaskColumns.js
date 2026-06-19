
const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check existing columns
    const columns = await sequelize.query(
      "SHOW COLUMNS FROM class_tasks",
      { type: QueryTypes.SELECT }
    );

    const existingColumns = columns.map(col => col.Field);
    console.log('Existing columns:', existingColumns);

    // Add description column if not exists
    if (!existingColumns.includes('description')) {
      await sequelize.query(
        "ALTER TABLE class_tasks ADD COLUMN description TEXT NULL AFTER title"
      );
      console.log('Column description added to class_tasks table');
    } else {
      console.log('Column description already exists');
    }

    // Add deadline column if not exists
    if (!existingColumns.includes('deadline')) {
      await sequelize.query(
        "ALTER TABLE class_tasks ADD COLUMN deadline DATETIME NULL AFTER description"
      );
      console.log('Column deadline added to class_tasks table');
    } else {
      console.log('Column deadline already exists');
    }

    // Add priority column if not exists
    if (!existingColumns.includes('priority')) {
      await sequelize.query(
        "ALTER TABLE class_tasks ADD COLUMN priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' AFTER deadline"
      );
      console.log('Column priority added to class_tasks table');
    } else {
      console.log('Column priority already exists');
    }

    // Add assignedTo column if not exists
    if (!existingColumns.includes('assignedTo')) {
      await sequelize.query(
        "ALTER TABLE class_tasks ADD COLUMN assignedTo JSON NULL AFTER priority"
      );
      console.log('Column assignedTo added to class_tasks table');
    } else {
      console.log('Column assignedTo already exists');
    }

    console.log('Migration completed successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();