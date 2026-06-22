const { sequelize } = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function addSubmissionColumns() {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.addColumn('student_progresses', 'submission', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    console.log('✅ Added column: submission');
  } catch (e) {
    console.log('ℹ️ submission column may already exist:', e.message);
  }

  try {
    await queryInterface.addColumn('student_progresses', 'submittedAt', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    console.log('✅ Added column: submittedAt');
  } catch (e) {
    console.log('ℹ️ submittedAt column may already exist:', e.message);
  }

  await sequelize.close();
}

addSubmissionColumns().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});