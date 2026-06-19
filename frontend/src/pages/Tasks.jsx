import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import './Tasks.css';

const API_URL = '/goals';

const GOAL_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export default function Tasks() {
  const [goals, setGoals]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [adding, setAdding]           = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');

  const fetchGoals = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { setGoals([]); setLoading(false); return; }
      const res = await axios.get(`${API_URL}?page=1&limit=50`);
      const data = res.data.data || res.data.rows || res.data;
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleToggle = async (goalId, taskId) => {
    try {
      const res = await axios.put(`${API_URL}/${goalId}/tasks/${taskId}/toggle`);
      const updatedTask = res.data.data || res.data;
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;
          const tasks = (g.tasks || []).map((t) =>
            t.id === taskId
              ? { ...t, completed: updatedTask.status === 'completed', status: updatedTask.status }
              : t
          );
          return { ...g, tasks, completedTasks: tasks.filter((t) => t.completed).length, totalTasks: tasks.length };
        })
      );
    } catch (err) { console.error('Toggle error:', err); }
  };

  const handleAddTask = async (goalId) => {
    if (!newTaskText.trim() || !goalId || adding) return;
    setAdding(true);
    try {
      const res = await axios.post(`${API_URL}/${goalId}/tasks`, {
        title: newTaskText.trim(),
        priority: 'medium',
      });
      const newTask = res.data.data || res.data;
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;
          const tasks = [...(g.tasks || []), { ...newTask, completed: newTask.status === 'completed' }];
          return { ...g, tasks, completedTasks: tasks.filter((t) => t.completed).length, totalTasks: tasks.length };
        })
      );
      setNewTaskText('');
    } catch (err) {
      console.error('Add task error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to add task. Please try again.';
      alert(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTask = async (goalId, taskId) => {
    if (!goalId) return;
    try {
      await axios.delete(`${API_URL}/${goalId}/tasks/${taskId}`);
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;
          const tasks = (g.tasks || []).filter((t) => t.id !== taskId);
          return { ...g, tasks, completedTasks: tasks.filter((t) => t.completed).length, totalTasks: tasks.length };
        })
      );
    } catch (err) { console.error('Delete error:', err); }
  };

  const toggleExpand = (goalId) => {
    setExpandedGoalId((prev) => (prev === goalId ? null : goalId));
    setNewTaskText('');
  };

  if (loading) {
    return (
      <div className="tk-loading">
        <div className="tk-spinner" />
      </div>
    );
  }

  return (
    <div className="tk-page">
      <div className="tk-page-inner">
        {/* Header */}
        <div className="tk-page-head">
          <h2 className="tk-page-title">My Goals & Tasks</h2>
          <span className="tk-page-count">{goals.length} goals</span>
        </div>

        {goals.length === 0 ? (
          <div className="tk-empty">
            <svg width="48" height="48" fill="none" stroke="#c4b5fd" strokeWidth="1.2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            <h3 className="tk-empty-title">No goals yet</h3>
            <p className="tk-empty-sub">Create a goal to start tracking your tasks</p>
          </div>
        ) : (
          <div className="tk-goals-grid">
            {goals.map((goal, idx) => {
              const tasks = goal.tasks || [];
              const done = tasks.filter((t) => t.completed).length;
              const total = tasks.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const color = GOAL_COLORS[idx % GOAL_COLORS.length];
              const isExpanded = goal.id === expandedGoalId;

              return (
                <div
                  key={goal.id}
                  className={`tk-goal-card ${isExpanded ? 'tk-goal-card-expanded' : ''}`}
                  style={{ '--goal-color': color }}
                >
                  {/* Goal Header (clickable to expand/collapse) */}
                  <div className="tk-goal-header" onClick={() => toggleExpand(goal.id)}>
                    <div className="tk-goal-header-left">
                      <div className="tk-goal-icon" style={{ background: `${color}15`, color }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      </div>
                      <div className="tk-goal-info">
                        <span className="tk-goal-name">{goal.title}</span>
                        <span className="tk-goal-meta">
                          {done} of {total} tasks completed
                        </span>
                      </div>
                    </div>
                    <div className="tk-goal-header-right">
                      <div className="tk-goal-ring">
                        <svg viewBox="0 0 36 36" className="tk-ring-svg">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none" stroke="#e4e2f9" strokeWidth="3"/>
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none" stroke={color} strokeWidth="3"
                            strokeDasharray={`${pct}, 100`}
                            strokeLinecap="round"/>
                        </svg>
                        <span className="tk-ring-text">{pct}%</span>
                      </div>
                      <svg
                        className={`tk-chevron ${isExpanded ? 'tk-chevron-open' : ''}`}
                        width="20" height="20"
                        fill="none" stroke="#a5a3c8" strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Tasks Section */}
                  {isExpanded && (
                    <div className="tk-goal-body">
                      {/* Progress bar */}
                      <div className="tk-progress-bar">
                        <div className="tk-progress-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>

                      {/* Add Task */}
                      <div className="tk-add">
                        <div className="tk-add-icon">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </div>
                        <input
                          className="tk-add-input"
                          placeholder="What needs to be done?"
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(goal.id); } }}
                        />
                        <button
                          className="tk-add-btn"
                          onClick={() => handleAddTask(goal.id)}
                          type="button"
                          disabled={!newTaskText.trim() || adding}
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
                        >
                          {adding ? 'Adding...' : 'Add'}
                        </button>
                      </div>

                      {/* Task List */}
                      <div className="tk-list">
                        {tasks.length === 0 ? (
                          <div className="tk-list-empty">
                            <svg width="28" height="28" fill="none" stroke="#d4d2f0" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            <p>No tasks yet. Add your first task above!</p>
                          </div>
                        ) : (
                          tasks.map((task, i) => (
                            <div
                              key={task.id}
                              className={`tk-task ${task.completed ? 'tk-task-done' : ''}`}
                              style={{ animationDelay: `${i * 0.03}s` }}
                            >
                              <button
                                className={`tk-check ${task.completed ? 'tk-check-on' : ''}`}
                                onClick={() => handleToggle(goal.id, task.id)}
                                style={task.completed ? { background: `linear-gradient(135deg, #22c55e, #16a34a)` } : {}}
                              >
                                {task.completed && (
                                  <svg width="12" height="12" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                                    <path d="M20 6L9 17l-5-5"/>
                                  </svg>
                                )}
                              </button>

                              <div className="tk-task-body">
                                <span className={`tk-task-title ${task.completed ? 'tk-task-title-done' : ''}`}>
                                  {task.title}
                                </span>
                                {task.completed && (
                                  <span className="tk-task-badge">Completed</span>
                                )}
                              </div>

                              <button className="tk-task-del" onClick={() => handleDeleteTask(goal.id, task.id)}>
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}