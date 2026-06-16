'use strict';
const User            = require('./User');
const Goal            = require('./Goal');
const Task            = require('./Task');
const TimeLog         = require('./TimeLog');
const Class           = require('./Class');
const ClassMember     = require('./ClassMember');
const ClassTask       = require('./ClassTask');
const ClassSchedule   = require('./ClassSchedule');
const StudentProgress = require('./StudentProgress');

// ===== USER — GOAL (student tự tạo mục tiêu) =====
User.hasMany(Goal,    { foreignKey: 'userId', as: 'goals',    onDelete: 'CASCADE' });
Goal.belongsTo(User,  { foreignKey: 'userId', as: 'user' });

// ===== USER — TASK (student tự tạo nhiệm vụ cá nhân) =====
User.hasMany(Task,    { foreignKey: 'userId', as: 'tasks',    onDelete: 'CASCADE' });
Task.belongsTo(User,  { foreignKey: 'userId', as: 'user' });

// ===== GOAL — TASK (nhiệm vụ gắn với mục tiêu) =====
Goal.hasMany(Task,    { foreignKey: 'goalId', as: 'goalTasks', onDelete: 'SET NULL' });
Task.belongsTo(Goal,  { foreignKey: 'goalId', as: 'goal' });

// ===== USER — TIMELOG (student ghi lại phiên học) =====
User.hasMany(TimeLog,   { foreignKey: 'userId', as: 'timeLogs', onDelete: 'CASCADE' });
TimeLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ===== TEACHER — CLASS (giáo viên tạo lớp) =====
User.hasMany(Class,    { foreignKey: 'teacherId', as: 'ownedClasses', onDelete: 'CASCADE' });
Class.belongsTo(User,  { foreignKey: 'teacherId', as: 'teacher' });

// ===== CLASS — STUDENT (N:N qua ClassMember) =====
Class.hasMany(ClassMember,   { foreignKey: 'classId',   as: 'members',  onDelete: 'CASCADE' });
ClassMember.belongsTo(Class, { foreignKey: 'classId',   as: 'class' });
User.hasMany(ClassMember,    { foreignKey: 'studentId', as: 'classEnrollments', onDelete: 'CASCADE' });
ClassMember.belongsTo(User,  { foreignKey: 'studentId', as: 'student' });

// ===== CLASS — CLASSTASK (giáo viên tạo nhiệm vụ lớp) =====
Class.hasMany(ClassTask,    { foreignKey: 'classId',   as: 'classTasks', onDelete: 'CASCADE' });
ClassTask.belongsTo(Class,  { foreignKey: 'classId',   as: 'class' });
User.hasMany(ClassTask,     { foreignKey: 'createdBy', as: 'createdTasks', onDelete: 'CASCADE' });
ClassTask.belongsTo(User,   { foreignKey: 'createdBy', as: 'creator' });

// ===== CLASS — CLASSSCHEDULE (giáo viên tạo lịch lớp) =====
Class.hasMany(ClassSchedule,    { foreignKey: 'classId',   as: 'schedules', onDelete: 'CASCADE' });
ClassSchedule.belongsTo(Class,  { foreignKey: 'classId',   as: 'class' });
User.hasMany(ClassSchedule,     { foreignKey: 'createdBy', as: 'createdSchedules', onDelete: 'CASCADE' });
ClassSchedule.belongsTo(User,   { foreignKey: 'createdBy', as: 'creator' });

// ===== STUDENTPROGRESS (giáo viên theo dõi tiến độ) =====
ClassTask.hasMany(StudentProgress,    { foreignKey: 'classTaskId', as: 'progresses', onDelete: 'CASCADE' });
StudentProgress.belongsTo(ClassTask,  { foreignKey: 'classTaskId', as: 'classTask' });
User.hasMany(StudentProgress,         { foreignKey: 'studentId',   as: 'progresses', onDelete: 'CASCADE' });
StudentProgress.belongsTo(User,       { foreignKey: 'studentId',   as: 'student' });
Class.hasMany(StudentProgress,        { foreignKey: 'classId',     as: 'progresses', onDelete: 'CASCADE' });
StudentProgress.belongsTo(Class,      { foreignKey: 'classId',     as: 'class' });

module.exports = {
  User, Goal, Task, TimeLog,
  Class, ClassMember, ClassTask, ClassSchedule, StudentProgress,
};