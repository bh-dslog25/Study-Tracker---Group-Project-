import { loadUserJSON, saveUserJSON } from './storage';

export const TIMER_SESSIONS_KEY = 'study_tracker_timer_sessions';
export const CALENDAR_TASKS_KEY = 'study_tracker_calendar_tasks';
export const TASKS_STORAGE_KEY = 'study_tracker_tasks';

const normalizePriority = (priority) => (
  ['high', 'medium', 'low', 'assignment'].includes(priority) ? priority : 'medium'
);

export const taskToTimerSession = (task) => ({
  id: task.id,
  title: task.name || task.title || 'Untitled task',
  project: task.deadline || task.project || 'Tasks',
  duration: Number(task.duration) || 25,
  done: Boolean(task.done),
});

export const taskToCalendarEntry = (task) => ({
  id: task.id,
  title: task.name || task.title || 'Untitled task',
  time: task.time || 'All Day',
  priority: normalizePriority(task.priority),
  desc: task.description || task.desc || '',
  done: Boolean(task.done),
});

export const calendarEntryToTask = (entry, date) => ({
  id: entry.id,
  name: entry.title || entry.name || 'Untitled task',
  deadline: date,
  goal: entry.goal || '',
  priority: normalizePriority(entry.priority === 'assignment' ? 'medium' : entry.priority),
  description: entry.desc || entry.description || '',
  done: Boolean(entry.done),
});

export const syncTaskToTimer = (userId, task, isDeleting = false) => {
  if (!userId || !task) return;
  const sessions = loadUserJSON(TIMER_SESSIONS_KEY, userId, []);

  if (isDeleting) {
    saveUserJSON(TIMER_SESSIONS_KEY, userId, sessions.filter(s => s.id !== task.id));
    return;
  }

  const sessionData = taskToTimerSession(task);
  const idx = sessions.findIndex(s => s.id === task.id);
  const updated = idx > -1
    ? sessions.map(s => s.id === task.id ? { ...s, ...sessionData } : s)
    : [sessionData, ...sessions];

  saveUserJSON(TIMER_SESSIONS_KEY, userId, updated);
};

export const syncTaskToCalendar = (userId, task, isDeleting = false) => {
  if (!userId || !task) return;
  const calendarTasks = loadUserJSON(CALENDAR_TASKS_KEY, userId, {});

  Object.keys(calendarTasks).forEach(date => {
    calendarTasks[date] = calendarTasks[date].filter(t => t.id !== task.id);
    if (calendarTasks[date].length === 0) delete calendarTasks[date];
  });

  if (!isDeleting && task.deadline) {
    const date = task.deadline;
    calendarTasks[date] = [
      ...(calendarTasks[date] || []),
      taskToCalendarEntry(task),
    ];
  }

  saveUserJSON(CALENDAR_TASKS_KEY, userId, calendarTasks);
};

export const upsertTaskInTasks = (userId, task) => {
  if (!userId || !task) return;
  const tasks = loadUserJSON(TASKS_STORAGE_KEY, userId, []);
  const exists = tasks.some(t => t.id === task.id);
  const updated = exists
    ? tasks.map(t => t.id === task.id ? { ...t, ...task } : t)
    : [...tasks, task];

  saveUserJSON(TASKS_STORAGE_KEY, userId, updated);
};

export const syncTaskEverywhere = (userId, task) => {
  upsertTaskInTasks(userId, task);
  syncTaskToTimer(userId, task);
  syncTaskToCalendar(userId, task);
};

export const syncTaskStatus = (userId, task) => {
  if (!userId || !task) return;

  const tasks = loadUserJSON(TASKS_STORAGE_KEY, userId, []);
  const updatedTasks = tasks.map(t => (
    t.id === task.id ? { ...t, done: Boolean(task.done) } : t
  ));
  saveUserJSON(TASKS_STORAGE_KEY, userId, updatedTasks);

  const sessions = loadUserJSON(TIMER_SESSIONS_KEY, userId, []);
  const updatedSessions = sessions.map(s => (
    s.id === task.id ? { ...s, done: Boolean(task.done) } : s
  ));
  saveUserJSON(TIMER_SESSIONS_KEY, userId, updatedSessions);

  const calendarTasks = loadUserJSON(CALENDAR_TASKS_KEY, userId, {});
  Object.keys(calendarTasks).forEach(date => {
    calendarTasks[date] = calendarTasks[date].map(t => (
      t.id === task.id ? { ...t, done: Boolean(task.done) } : t
    ));
  });
  saveUserJSON(CALENDAR_TASKS_KEY, userId, calendarTasks);
};

export const syncTaskDeletion = (userId, task) => {
  syncTaskToTimer(userId, task, true);
  syncTaskToCalendar(userId, task, true);
};

export const deleteTaskEverywhere = (userId, task) => {
  if (!userId || !task) return;
  const tasks = loadUserJSON(TASKS_STORAGE_KEY, userId, []);
  saveUserJSON(TASKS_STORAGE_KEY, userId, tasks.filter(t => t.id !== task.id));
  syncTaskDeletion(userId, task);
};
