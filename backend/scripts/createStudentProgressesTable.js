const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check if student_progresses table exists
    const tables = await sequelize.query(
      "SHOW TABLES LIKE 'student_progresses'",
      { type: QueryTypes.SELECT }
    );

    if (tables.length === 0) {
      // Create student_progresses table
      await sequelize.query(`
        CREATE TABLE student_progresses (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          classId INT UNSIGNED NOT NULL,
          studentId INT UNSIGNED NOT NULL,
          classTaskId INT UNSIGNED NOT NULL,
          status ENUM('assigned', 'in_progress', 'completed', 'late') NOT NULL DEFAULT 'assigned',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_class_task (classId, classTaskId),
          INDEX idx_student (studentId)
        )
      `);
      console.log('Table student_progresses created successfully!');
    } else {
      console.log('Table student_progresses already exists.');
    }

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();