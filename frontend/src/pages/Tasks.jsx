import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import './Tasks.css';

const API_URL = '/goals';

const GOAL_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700 border-red-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export default function Tasks() {
  const [goals, setGoals]             = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [adding, setAdding]           = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [activeTab, setActiveTab]     = useState('goals');
  const [taskStates, setTaskStates]   = useState({}); // { taskId: { showSubmit, submission, submitting, status } }

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

  const fetchAssignedTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { setAssignedTasks([]); return; }
      const res = await axios.get('/tasks/student/assigned');
      if (res.data.success && Array.isArray(res.data.data)) {
        setAssignedTasks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching assigned tasks:', err);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
    fetchAssignedTasks();
    const interval = setInterval(fetchAssignedTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchGoals, fetchAssignedTasks]);

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

  const handleSubmit = async (taskId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Vui lòng đăng nhập để nộp bài');
      return;
    }
    const st = taskStates[taskId] || {};
    if (!st.submission?.trim()) return;
    setTaskStates(prev => ({ ...prev, [taskId]: { ...prev[taskId], submitting: true } }));
    try {
      await axios.put(`/tasks/student/${taskId}/submit`, { submission: st.submission.trim() });
      setTaskStates(prev => ({ ...prev, [taskId]: { ...prev[taskId], submitting: false, showSubmit: false, submission: '', status: 'completed' } }));
      fetchAssignedTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting task');
      setTaskStates(prev => ({ ...prev, [taskId]: { ...prev[taskId], submitting: false } }));
    }
  };

  const handleMarkProgress = async (taskId, status) => {
    try {
      await axios.put(`/tasks/student/${taskId}/progress`, { status });
      setTaskStates(prev => ({ ...prev, [taskId]: { ...prev[taskId], status } }));
      fetchAssignedTasks();
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const getTaskState = (taskId) => taskStates[taskId] || { showSubmit: false, submission: '', submitting: false, status: 'assigned' };

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
        <div className="tk-page-head">
          <h2 className="tk-page-title">My Tasks</h2>
          <span className="tk-page-count">
            {activeTab === 'goals' ? `${goals.length} goals` : `${assignedTasks.length} assigned`}
          </span>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'goals'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Personal Goals
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all relative ${
              activeTab === 'assigned'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Class Tasks
            {assignedTasks.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-indigo-600 text-white rounded-full">
                {assignedTasks.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'goals' ? (
          goals.length === 0 ? (
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
                  <div key={goal.id} className={`tk-goal-card ${isExpanded ? 'tk-goal-card-expanded' : ''}`} style={{ '--goal-color': color }}>
                    <div className="tk-goal-header" onClick={() => toggleExpand(goal.id)}>
                      <div className="tk-goal-header-left">
                        <div className="tk-goal-icon" style={{ background: `${color}15`, color }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                        </div>
                        <div className="tk-goal-info">
                          <span className="tk-goal-name">{goal.title}</span>
                          <span className="tk-goal-meta">{done} of {total} tasks completed</span>
                        </div>
                      </div>
                      <div className="tk-goal-header-right">
                        <div className="tk-goal-ring">
                          <svg viewBox="0 0 36 36" className="tk-ring-svg">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e4e2f9" strokeWidth="3"/>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round"/>
                          </svg>
                          <span className="tk-ring-text">{pct}%</span>
                        </div>
                        <svg className={`tk-chevron ${isExpanded ? 'tk-chevron-open' : ''}`} width="20" height="20" fill="none" stroke="#a5a3c8" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="tk-goal-body">
                        <div className="tk-progress-bar">
                          <div className="tk-progress-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <div className="tk-add">
                          <div className="tk-add-icon">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                          </div>
                          <input className="tk-add-input" placeholder="What needs to be done?"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(goal.id); } }}
                          />
                          <button className="tk-add-btn" onClick={() => handleAddTask(goal.id)}
                            type="button" disabled={!newTaskText.trim() || adding}
                            style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
                            {adding ? 'Adding...' : 'Add'}
                          </button>
                        </div>
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
                              <div key={task.id} className={`tk-task ${task.completed ? 'tk-task-done' : ''}`} style={{ animationDelay: `${i * 0.03}s` }}>
                                <button className={`tk-check ${task.completed ? 'tk-check-on' : ''}`}
                                  onClick={() => handleToggle(goal.id, task.id)}
                                  style={task.completed ? { background: `linear-gradient(135deg, #22c55e, #16a34a)` } : {}}>
                                  {task.completed && (
                                    <svg width="12" height="12" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                                      <path d="M20 6L9 17l-5-5"/>
                                    </svg>
                                  )}
                                </button>
                                <div className="tk-task-body">
                                  <span className={`tk-task-title ${task.completed ? 'tk-task-title-done' : ''}`}>{task.title}</span>
                                  {task.completed && <span className="tk-task-badge">Completed</span>}
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
          )
        ) : (
          <div className="space-y-4">
            {assignedTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
                <svg className="mx-auto mb-4" width="48" height="48" fill="none" stroke="#c4b5fd" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No assigned tasks</h3>
                <p className="text-sm text-slate-400">Tasks assigned by your teachers will appear here</p>
              </div>
            ) : (
              assignedTasks.map(task => {
                const st = getTaskState(task.id);
                return (
                  <div key={task.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-base text-slate-800">{task.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-slate-500 mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                          {task.class?.name && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                              </svg>
                              {task.class.name}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            st.status === 'completed'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : st.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {st.status === 'completed' ? '✓ Completed' : st.status === 'in_progress' ? '⟳ In Progress' : '○ Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                      {st.status === 'in_progress' && (
                        <button onClick={() => handleMarkProgress(task.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-200 transition-colors">
                          Mark Complete
                        </button>
                      )}
                      <button onClick={() => setTaskStates(prev => ({ ...prev, [task.id]: { ...prev[task.id], showSubmit: !st.showSubmit } }))}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200 transition-colors">
                        {st.showSubmit ? 'Cancel' : 'Submit Answer'}
                      </button>
                    </div>
                    {st.showSubmit && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                        <textarea value={st.submission} onChange={e => setTaskStates(prev => ({ ...prev, [task.id]: { ...prev[task.id], submission: e.target.value } }))}
                          placeholder="Enter your answer here..."
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 mb-2"
                        />
                        <button onClick={() => handleSubmit(task.id)} disabled={st.submitting || !st.submission?.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                          {st.submitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}