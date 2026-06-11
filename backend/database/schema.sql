CREATE DATABASE IF NOT EXISTS `study_tracker`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `study_tracker`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `lastLogin` DATETIME NULL,
  `refreshToken` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `goals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `targetHours` DECIMAL(6, 2) NOT NULL,
  `achievedHours` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  `type` ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL DEFAULT 'weekly',
  `status` ENUM('active', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'active',
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `isAutoRenew` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `goals_user_id_index` (`userId`),
  KEY `goals_status_type_index` (`status`, `type`),
  CONSTRAINT `goals_user_id_fk`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  `status` ENUM('todo', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'todo',
  `dueDate` DATE NULL,
  `completedAt` DATETIME NULL,
  `estimatedMinutes` INT NULL,
  `tags` JSON NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tasks_user_id_index` (`userId`),
  KEY `tasks_status_priority_index` (`status`, `priority`),
  CONSTRAINT `tasks_user_id_fk`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `time_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `notes` TEXT NULL,
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME NULL,
  `durationMinutes` INT NULL,
  `status` ENUM('ongoing', 'completed', 'paused') NOT NULL DEFAULT 'ongoing',
  `rating` TINYINT UNSIGNED NULL,
  `focusScore` TINYINT UNSIGNED NULL,
  `tags` JSON NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `time_logs_user_id_index` (`userId`),
  KEY `time_logs_status_start_time_index` (`status`, `startTime`),
  CONSTRAINT `time_logs_user_id_fk`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `time_logs_rating_check` CHECK (`rating` IS NULL OR (`rating` BETWEEN 1 AND 5)),
  CONSTRAINT `time_logs_focus_score_check` CHECK (`focusScore` IS NULL OR (`focusScore` BETWEEN 1 AND 10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `teacherId` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `inviteCode` VARCHAR(10) NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `maxStudents` INT NOT NULL DEFAULT 50,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `classes_invite_code_unique` (`inviteCode`),
  KEY `classes_teacher_id_index` (`teacherId`),
  CONSTRAINT `classes_teacher_id_fk`
    FOREIGN KEY (`teacherId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `class_members` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classId` INT UNSIGNED NOT NULL,
  `studentId` INT UNSIGNED NOT NULL,
  `joinedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('active', 'removed') NOT NULL DEFAULT 'active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_members_class_student_unique` (`classId`, `studentId`),
  KEY `class_members_student_id_index` (`studentId`),
  CONSTRAINT `class_members_class_id_fk`
    FOREIGN KEY (`classId`) REFERENCES `classes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_members_student_id_fk`
    FOREIGN KEY (`studentId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `class_tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classId` INT UNSIGNED NOT NULL,
  `createdBy` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `dueDate` DATE NULL,
  `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `attachmentUrl` VARCHAR(500) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `class_tasks_class_id_index` (`classId`),
  KEY `class_tasks_created_by_index` (`createdBy`),
  CONSTRAINT `class_tasks_class_id_fk`
    FOREIGN KEY (`classId`) REFERENCES `classes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_tasks_created_by_fk`
    FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `class_schedules` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classId` INT UNSIGNED NOT NULL,
  `createdBy` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME NOT NULL,
  `location` VARCHAR(200) NULL,
  `meetingUrl` VARCHAR(500) NULL,
  `type` ENUM('lesson', 'exam', 'review', 'other') NOT NULL DEFAULT 'lesson',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `class_schedules_class_id_index` (`classId`),
  KEY `class_schedules_created_by_index` (`createdBy`),
  KEY `class_schedules_start_time_index` (`startTime`),
  CONSTRAINT `class_schedules_class_id_fk`
    FOREIGN KEY (`classId`) REFERENCES `classes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_schedules_created_by_fk`
    FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_progress` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `classId` INT UNSIGNED NOT NULL,
  `classTaskId` INT UNSIGNED NOT NULL,
  `studentId` INT UNSIGNED NOT NULL,
  `status` ENUM('assigned', 'in_progress', 'completed', 'late') NOT NULL DEFAULT 'assigned',
  `completedAt` DATETIME NULL,
  `note` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_progress_task_student_unique` (`classTaskId`, `studentId`),
  KEY `student_progress_class_id_index` (`classId`),
  KEY `student_progress_student_id_index` (`studentId`),
  CONSTRAINT `student_progress_class_id_fk`
    FOREIGN KEY (`classId`) REFERENCES `classes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_progress_class_task_id_fk`
    FOREIGN KEY (`classTaskId`) REFERENCES `class_tasks` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `student_progress_student_id_fk`
    FOREIGN KEY (`studentId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
