'use strict';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Study Tracker API',
    version: '1.0.0',
    description: 'API documentation for Study Tracker backend',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and account APIs' },
    { name: 'Goals', description: 'Personal study goals' },
    { name: 'Tasks', description: 'Personal study tasks' },
    { name: 'Time Logs', description: 'Study session tracking' },
    { name: 'Classes', description: 'Class management, schedules, class tasks, and progress' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Nguyen Van A' },
          email: { type: 'string', format: 'email', example: 'student@example.com' },
          role: { type: 'string', enum: ['student', 'teacher'], example: 'student' },
          isActive: { type: 'boolean', example: true },
          lastLogin: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Nguyen Van A' },
          email: { type: 'string', format: 'email', example: 'student@example.com' },
          password: { type: 'string', minLength: 6, example: '123456' },
          role: { type: 'string', enum: ['student', 'teacher'], example: 'student' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'student@example.com' },
          password: { type: 'string', example: '123456' },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Study English 20 hours' },
          description: { type: 'string', nullable: true },
          targetHours: { type: 'number', format: 'float', example: 20 },
          achievedHours: { type: 'number', format: 'float', example: 5.5 },
          type: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'custom'], example: 'weekly' },
          status: { type: 'string', enum: ['active', 'completed', 'failed', 'cancelled'], example: 'active' },
          startDate: { type: 'string', format: 'date', example: '2026-06-01' },
          endDate: { type: 'string', format: 'date', example: '2026-06-30' },
          isAutoRenew: { type: 'boolean', example: false },
        },
      },
      GoalInput: {
        type: 'object',
        required: ['title', 'targetHours', 'startDate', 'endDate', 'type'],
        properties: {
          title: { type: 'string', example: 'Study English 20 hours' },
          description: { type: 'string', example: 'IELTS listening practice' },
          targetHours: { type: 'number', format: 'float', example: 20 },
          type: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'custom'], example: 'weekly' },
          startDate: { type: 'string', format: 'date', example: '2026-06-01' },
          endDate: { type: 'string', format: 'date', example: '2026-06-30' },
          isAutoRenew: { type: 'boolean', example: false },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Finish math homework' },
          description: { type: 'string', nullable: true },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'medium' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'completed', 'cancelled'], example: 'todo' },
          dueDate: { type: 'string', format: 'date', nullable: true },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          estimatedMinutes: { type: 'integer', nullable: true, example: 60 },
          tags: { type: 'array', items: { type: 'string' }, example: ['math'] },
        },
      },
      TaskInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Finish math homework' },
          description: { type: 'string', example: 'Chapter 3 exercises' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'medium' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'completed', 'cancelled'], example: 'todo' },
          dueDate: { type: 'string', format: 'date', example: '2026-06-20' },
          estimatedMinutes: { type: 'integer', example: 60 },
          tags: { type: 'array', items: { type: 'string' }, example: ['math'] },
        },
      },
      TimeLog: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Morning study session' },
          notes: { type: 'string', nullable: true },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time', nullable: true },
          durationMinutes: { type: 'integer', nullable: true, example: 90 },
          status: { type: 'string', enum: ['ongoing', 'completed', 'paused'], example: 'ongoing' },
          rating: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
          focusScore: { type: 'integer', minimum: 1, maximum: 10, nullable: true },
          tags: { type: 'array', items: { type: 'string' }, example: ['english'] },
        },
      },
      TimeLogStartInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Morning study session' },
          notes: { type: 'string', example: 'Focus on listening practice' },
          tags: { type: 'array', items: { type: 'string' }, example: ['english'] },
        },
      },
      TimeLogStopInput: {
        type: 'object',
        properties: {
          notes: { type: 'string', example: 'Completed lesson 2' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          focusScore: { type: 'integer', minimum: 1, maximum: 10, example: 8 },
          tags: { type: 'array', items: { type: 'string' }, example: ['english'] },
        },
      },
      Class: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          teacherId: { type: 'integer', example: 2 },
          name: { type: 'string', example: 'English A1' },
          description: { type: 'string', nullable: true },
          inviteCode: { type: 'string', example: 'ABC123' },
          isActive: { type: 'boolean', example: true },
          maxStudents: { type: 'integer', example: 50 },
        },
      },
      ClassInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'English A1' },
          description: { type: 'string', example: 'Beginner English class' },
          maxStudents: { type: 'integer', example: 50 },
        },
      },
      ClassTaskInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Essay homework' },
          description: { type: 'string', example: 'Write 300 words about your weekend' },
          dueDate: { type: 'string', format: 'date', example: '2026-06-25' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
          attachmentUrl: { type: 'string', example: 'https://example.com/file.pdf' },
        },
      },
      ClassScheduleInput: {
        type: 'object',
        required: ['title', 'startTime', 'endTime'],
        properties: {
          title: { type: 'string', example: 'Lesson 1' },
          description: { type: 'string', example: 'Introduction lesson' },
          startTime: { type: 'string', format: 'date-time', example: '2026-06-20T08:00:00.000Z' },
          endTime: { type: 'string', format: 'date-time', example: '2026-06-20T10:00:00.000Z' },
          location: { type: 'string', example: 'Room 101' },
          meetingUrl: { type: 'string', example: 'https://meet.google.com/example' },
          type: { type: 'string', enum: ['lesson', 'exam', 'review', 'other'], example: 'lesson' },
        },
      },
      ProgressUpdateInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['in_progress', 'completed'], example: 'completed' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health',
        responses: {
          200: { description: 'API is running' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Registered successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokens' } } },
          },
          409: { description: 'Email already exists' },
          422: { description: 'Validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Logged in successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokens' } } },
          },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Token refreshed' },
          401: { description: 'Invalid refresh token' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'Logout current user',
        responses: {
          200: { description: 'Logged out successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'Get current user',
        responses: {
          200: { description: 'Current user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Unauthorized' },
        },
      },
      put: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'Update current user profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string', example: 'Nguyen Van A' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/change-password': {
      put: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'Change current user password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', example: '123456' },
                  newPassword: { type: 'string', minLength: 6, example: '654321' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed' },
          400: { description: 'Current password is incorrect' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/goals': {
      get: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'List personal goals',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'completed', 'failed', 'cancelled'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'custom'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Goal list' }, 401: { description: 'Unauthorized' } },
      },
      post: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a personal goal',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GoalInput' } } } },
        responses: { 201: { description: 'Goal created' }, 422: { description: 'Validation error' } },
      },
    },
    '/api/goals/{id}': {
      put: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'Update a personal goal',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GoalInput' } } } },
        responses: { 200: { description: 'Goal updated' }, 404: { description: 'Goal not found' } },
      },
      delete: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'Delete a personal goal',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Goal deleted' }, 404: { description: 'Goal not found' } },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        summary: 'List personal tasks',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'in_progress', 'completed', 'cancelled'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Task list' } },
      },
      post: {
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a personal task',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } } } },
        responses: { 201: { description: 'Task created' }, 422: { description: 'Validation error' } },
      },
    },
    '/api/tasks/{id}': {
      put: {
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        summary: 'Update a personal task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } } } },
        responses: { 200: { description: 'Task updated' }, 404: { description: 'Task not found' } },
      },
      delete: {
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        summary: 'Delete a personal task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Task deleted' }, 404: { description: 'Task not found' } },
      },
    },
    '/api/timelogs': {
      get: {
        tags: ['Time Logs'],
        security: [{ bearerAuth: [] }],
        summary: 'List study sessions',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ongoing', 'completed', 'paused'] } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Study session list' } },
      },
    },
    '/api/timelogs/stats': {
      get: {
        tags: ['Time Logs'],
        security: [{ bearerAuth: [] }],
        summary: 'Get study session statistics',
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Study statistics' } },
      },
    },
    '/api/timelogs/start': {
      post: {
        tags: ['Time Logs'],
        security: [{ bearerAuth: [] }],
        summary: 'Start a study session',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TimeLogStartInput' } } } },
        responses: { 201: { description: 'Study session started' }, 409: { description: 'An ongoing session already exists' } },
      },
    },
    '/api/timelogs/{id}/stop': {
      put: {
        tags: ['Time Logs'],
        security: [{ bearerAuth: [] }],
        summary: 'Stop a study session',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/TimeLogStopInput' } } } },
        responses: { 200: { description: 'Study session stopped' }, 400: { description: 'Session already completed' }, 404: { description: 'Session not found' } },
      },
    },
    '/api/timelogs/{id}': {
      delete: {
        tags: ['Time Logs'],
        security: [{ bearerAuth: [] }],
        summary: 'Delete a study session',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Study session deleted' }, 404: { description: 'Session not found' } },
      },
    },
    '/api/classes': {
      post: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher creates a class',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ClassInput' } } } },
        responses: { 201: { description: 'Class created' }, 403: { description: 'Teacher only' } },
      },
    },
    '/api/classes/my-classes': {
      get: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher lists owned classes',
        responses: { 200: { description: 'Owned classes' }, 403: { description: 'Teacher only' } },
      },
    },
    '/api/classes/join': {
      post: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Student joins class by invite code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['inviteCode'],
                properties: { inviteCode: { type: 'string', example: 'ABC123' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Joined class' }, 403: { description: 'Student only' }, 404: { description: 'Invite code not found' } },
      },
    },
    '/api/classes/joined': {
      get: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Student lists joined classes',
        responses: { 200: { description: 'Joined classes' }, 403: { description: 'Student only' } },
      },
    },
    '/api/classes/{id}/detail': {
      get: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher gets class detail',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Class detail' }, 404: { description: 'Class not found' } },
      },
    },
    '/api/classes/{id}': {
      put: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher updates class',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ClassInput' } } } },
        responses: { 200: { description: 'Class updated' }, 404: { description: 'Class not found' } },
      },
      delete: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher deletes class',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Class deleted' }, 404: { description: 'Class not found' } },
      },
    },
    '/api/classes/{id}/students/{studentId}': {
      delete: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher removes a student from class',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'studentId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Student removed' }, 404: { description: 'Class or student not found' } },
      },
    },
    '/api/classes/{id}/leave': {
      delete: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Student leaves class',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Left class' }, 404: { description: 'Membership not found' } },
      },
    },
    '/api/classes/{classId}/tasks': {
      get: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'List class tasks',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Class tasks' }, 403: { description: 'Not a class member or teacher' } },
      },
      post: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher creates a class task',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ClassTaskInput' } } } },
        responses: { 201: { description: 'Class task created' }, 403: { description: 'Teacher only' } },
      },
    },
    '/api/classes/{classId}/tasks/{taskId}': {
      put: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher updates a class task',
        parameters: [
          { name: 'classId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ClassTaskInput' } } } },
        responses: { 200: { description: 'Class task updated' }, 404: { description: 'Class task not found' } },
      },
      delete: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher deletes a class task',
        parameters: [
          { name: 'classId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Class task deleted' }, 404: { description: 'Class task not found' } },
      },
    },
    '/api/classes/{classId}/schedules': {
      get: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'List class schedules',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Class schedules' }, 403: { description: 'Not a class member or teacher' } },
      },
      post: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher creates a class schedule',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ClassScheduleInput' } } } },
        responses: { 201: { description: 'Class schedule created' }, 403: { description: 'Teacher only' } },
      },
    },
    '/api/classes/{classId}/schedules/{scheduleId}': {
      put: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher updates a class schedule',
        parameters: [
          { name: 'classId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'scheduleId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ClassScheduleInput' } } } },
        responses: { 200: { description: 'Class schedule updated' }, 404: { description: 'Class schedule not found' } },
      },
      delete: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher deletes a class schedule',
        parameters: [
          { name: 'classId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'scheduleId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Class schedule deleted' }, 404: { description: 'Class schedule not found' } },
      },
    },
    '/api/classes/{classId}/progress': {
      get: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher gets class progress',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Class progress' }, 403: { description: 'Teacher only' } },
      },
    },
    '/api/classes/{classId}/progress/{studentId}': {
      get: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Teacher gets one student progress',
        parameters: [
          { name: 'classId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'studentId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Student progress' }, 403: { description: 'Teacher only' } },
      },
    },
    '/api/classes/{classId}/my-progress': {
      get: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Student gets own class progress',
        parameters: [{ name: 'classId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Own progress' }, 403: { description: 'Student only' } },
      },
    },
    '/api/classes/progress/{progressId}': {
      patch: {
        tags: ['Classes'],
        security: [{ bearerAuth: [] }],
        summary: 'Student updates own progress status',
        parameters: [{ name: 'progressId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProgressUpdateInput' } } } },
        responses: { 200: { description: 'Progress updated' }, 404: { description: 'Progress not found' } },
      },
    },
  },
};

module.exports = swaggerSpec;
