import { loadUserJSON, saveUserJSON } from './storage';

export const GOALS_STORAGE_KEY = 'study_tracker_goals';
export const TASKS_STORAGE_KEY = 'study_tracker_tasks';

const asId = (value) => String(value);

export const calculateGoalProgress = (goal, tasks) => {
  const linkedTaskIds = goal.linkedTaskIds || [];
  if (!linkedTaskIds.length) {
    return {
      progress: goal.progress || 0,
      completed: (goal.progress || 0) >= 100,
    };
  }

  const linkedSet = new Set(linkedTaskIds.map(asId));
  const linkedTasks = tasks.filter((task) => linkedSet.has(asId(task.id)));
  const doneCount = linkedTasks.filter((task) => task.done).length;
  const progress = linkedTasks.length ? Math.round((doneCount / linkedTasks.length) * 100) : 0;

  return {
    progress,
    completed: linkedTasks.length > 0 && doneCount === linkedTasks.length,
  };
};

export const recalculateGoalsWithTasks = (goals, tasks) =>
  goals.map((goal) => {
    const result = calculateGoalProgress(goal, tasks);
    return {
      ...goal,
      progress: result.progress,
      completed: result.completed,
    };
  });

export const updateGoalsProgressFromTasks = (userId, tasks) => {
  const goals = loadUserJSON(GOALS_STORAGE_KEY, userId, []);
  const updatedGoals = recalculateGoalsWithTasks(goals, tasks);

  if (JSON.stringify(goals) !== JSON.stringify(updatedGoals)) {
    saveUserJSON(GOALS_STORAGE_KEY, userId, updatedGoals);
  }

  return updatedGoals;
};
