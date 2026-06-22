import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './Calendar.css';
import goalService from '../services/goalService';
import { useAuth } from '../context/AuthContext';

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateStr = (str) => {
  const [y, m, d] = str.split('-');
  return new Date(y, m - 1, d);
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const PRIORITY_STYLES = {
  high:       { bar: 'bg-red-500',   chip: 'bg-red-100 text-red-800',   label: 'High Priority' },
  medium:     { bar: 'bg-green-600', chip: 'bg-green-100 text-green-800', label: 'Medium' },
  assignment: { bar: 'bg-cyan-600',  chip: 'bg-cyan-100 text-cyan-800',   label: 'Assignment' },
};

const INITIAL_TASKS = {
  '2026-05-09': [
    { id: 1, title: 'History Midterm', time: '10:00 AM', priority: 'high',       desc: 'Chapters 4-8. Focus on the industrial revolution impacts.' },
    { id: 2, title: 'Review Notes',    time: '2:00 PM',  priority: 'medium',     desc: 'Consolidate lecture notes for upcoming CS seminar.' },
    { id: 3, title: 'Lab Report Due',  time: '11:59 PM', priority: 'assignment', desc: 'Physics lab report' },
  ],
  '2026-05-11': [
    { id: 4, title: 'Project Pitch',   time: '09:00 AM', priority: 'high',       desc: 'System Analysis and Design presentation.' },
  ],
};

function TaskModal({ isOpen, isEditing, form, setForm, onSave, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="cal-modal">
        <h2 className="cal-modal-title">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
        <div className="cal-modal-fields">
          <input
            type="text"
            placeholder="Task Name (e.g. Read Chapter 4)"
            className="cal-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="cal-modal-row">
            <input
              type="time"
              className="cal-input cal-input-half"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
            <select
              className="cal-input cal-input-half"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <textarea
            placeholder="Description (optional)"
            className="cal-input cal-textarea"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          />
        </div>
        <div className="cal-modal-actions">
          <button onClick={onCancel} className="cal-btn-cancel">Cancel</button>
          <button onClick={onSave} className="cal-btn-save">Save Task</button>
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate]     = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate]   = useState(formatDate(today));
  const [tasksData, setTasksData]         = useState(INITIAL_TASKS);
  const [notesData, setNotesData]         = useState({});
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState({ title: '', time: '', priority: 'high', desc: '' });
  const [editingNote, setEditingNote]     = useState(false);

  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const { user } = useAuth();

  const fetchGoals = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      setLoadingGoals(true);
      const response = await goalService.getAll({ page: 1, limit: 100 });
      const goalsData = response.data?.data || response.data?.rows || response.data || [];
      setGoals(Array.isArray(goalsData) ? goalsData : []);
    } catch (error) {
      console.error("Error fetching goals for calendar:", error);
    } finally {
      setLoadingGoals(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const cells = useMemo(() => {
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    const result      = [];
    for (let i = firstDay - 1; i >= 0; i--)
      result.push({ type: 'filler', day: daysInPrev - i });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(new Date(year, month, d));
      result.push({ type: 'current', day: d, dateStr });
    }
    const total = result.length;
    const rows  = Math.ceil(total / 7);
    for (let d = 1; d <= rows * 7 - total; d++)
      result.push({ type: 'filler', day: d });
    return result;
  }, [year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday   = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDate(today));
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ title: '', time: '', priority: 'high', desc: '' });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingId(task.id);
    let timeVal = '';
    if (task.time && task.time !== 'All Day') {
      const [timePart, mod] = task.time.split(' ');
      let [h, min] = timePart.split(':');
      h = parseInt(h);
      if (mod === 'PM' && h < 12) h += 12;
      if (mod === 'AM' && h === 12) h = 0;
      timeVal = `${String(h).padStart(2,'0')}:${min}`;
    }
    setForm({ title: task.title, time: timeVal, priority: task.priority, desc: task.desc || '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { alert('Please enter a task name!'); return; }
    let formattedTime = 'All Day';
    if (form.time) {
      let [h, min] = form.time.split(':');
      h = parseInt(h);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      formattedTime = `${h}:${min} ${ampm}`;
    }
    setTasksData((prev) => {
      const list = [...(prev[selectedDate] || [])];
      if (editingId) {
        const idx = list.findIndex((t) => t.id === editingId);
        if (idx > -1) list[idx] = { id: editingId, title: form.title, time: formattedTime, priority: form.priority, desc: form.desc };
      } else {
        list.push({ id: Date.now(), title: form.title, time: formattedTime, priority: form.priority, desc: form.desc });
      }
      return { ...prev, [selectedDate]: list };
    });
    setModalOpen(false);
  };

  const handleDelete = (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setTasksData((prev) => {
      const list = (prev[selectedDate] || []).filter((t) => t.id !== taskId);
      const next = { ...prev };
      if (list.length === 0) delete next[selectedDate];
      else next[selectedDate] = list;
      return next;
    });
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    setEditingNote(false);
  };

  const goalsByDate = useMemo(() => {
    const map = {};
    goals.forEach(g => {
      if (g.endDate) {
        const dateKey = g.endDate.split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(g);
      }
    });
    return map;
  }, [goals]);

  const selectedDateObj  = parseDateStr(selectedDate);
  const selectedLabel    = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const dayTasks         = tasksData[selectedDate] || [];
  const dayGoals         = goalsByDate[selectedDate] || [];
  const dayNote          = notesData[selectedDate] || '';

  return (
    <div className="cal-page">
      {/* Header */}
      <header className="cal-header">
        <h1 className="cal-title">Calendar</h1>
        <div className="cal-nav">
          <button onClick={goToday} className="cal-nav-btn cal-today-btn">Today</button>
          <button onClick={prevMonth} className="cal-nav-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="cal-month-label">{MONTH_NAMES[month]} {year}</span>
          <button onClick={nextMonth} className="cal-nav-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="cal-body">
        {/* Calendar grid */}
        <main className="cal-grid-wrapper">
          <div className="cal-day-headers">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}
          </div>
          <div className="cal-grid">
            {cells.map((cell, idx) => {
              if (cell.type === 'filler') return (
                <div key={`f-${idx}`} className="cal-cell cal-cell-filler">
                  <span className="cal-cell-day cal-cell-day-filler">{cell.day}</span>
                </div>
              );
              const isSelected = cell.dateStr === selectedDate;
              const isToday    = cell.dateStr === formatDate(today);
              const cellTasks  = tasksData[cell.dateStr] || [];
              const cellGoals  = goalsByDate[cell.dateStr] || [];
              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`cal-cell ${isSelected ? 'cal-cell-selected' : 'cal-cell-normal'}`}
                >
                  <span className={`cal-cell-day ${isToday ? 'cal-cell-day-today' : 'cal-cell-day-normal'}`}>
                    {cell.day}
                  </span>
                  {cellTasks.map((t) => (
                    <div key={t.id} className={`cal-cell-task ${PRIORITY_STYLES[t.priority].chip}`}>
                      {t.title}
                    </div>
                  ))}
                  {cellGoals.length > 0 && (
                    <div className="cal-cell-goal-dot flex gap-0.5 mt-0.5 justify-center">
                      {cellGoals.slice(0, 2).map((g) => (
                        <div key={g.id} className="w-1.5 h-1.5 rounded-full bg-indigo-500" title={g.title} />
                      ))}
                      {cellGoals.length > 2 && (
                        <span className="text-[9px] text-indigo-500 font-bold">+{cellGoals.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* Side panel */}
        <aside className="cal-side">
          {/* Panel header */}
          <div className="cal-side-header">
            <h3 className="cal-side-date">{selectedLabel}</h3>
            <p className="cal-side-count">
              {dayTasks.length === 0 ? '0 items scheduled' : `${dayTasks.length} ${dayTasks.length === 1 ? 'item' : 'items'} scheduled`}
            </p>
            <button onClick={openNew} className="cal-new-task-btn">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              New Task
            </button>
          </div>

          {/* Goals due this day */}
          {dayGoals.length > 0 && (
            <div className="cal-goals-section">
              <h4 className="cal-notes-title mb-2">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Goals Due
              </h4>
              <div className="space-y-2 mb-4">
                {dayGoals.map(g => {
                  const tasks = g.tasks || [];
                  const completed = tasks.filter(t => t.completed).length;
                  const total = tasks.length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div key={g.id} className="cal-goal-card p-3 rounded-xl border border-indigo-100 bg-indigo-50/50">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-semibold text-indigo-800 truncate">{g.title}</h5>
                        <span className="text-[10px] font-bold text-indigo-500">{pct}%</span>
                      </div>
                      {g.description && (
                        <p className="text-[11px] text-indigo-600/70 line-clamp-1 mb-1">{g.description}</p>
                      )}
                      <div className="w-full h-1 bg-indigo-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      {total > 0 && (
                        <p className="text-[10px] text-indigo-400 mt-1 font-medium">{completed}/{total} tasks done</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task list */}
          <div className="cal-task-list">
            {dayTasks.length === 0 ? (
              dayGoals.length === 0 ? (
                <p className="cal-empty">No tasks or goals scheduled for this day.</p>
              ) : null
            ) : (
              dayTasks.map((task) => {
                const s = PRIORITY_STYLES[task.priority];
                return (
                  <div key={task.id} className="cal-task-card">
                    <div className={`cal-task-bar ${s.bar}`} />
                    <div className="cal-task-content">
                      <div className="cal-task-top">
                        <span className={`cal-task-chip ${s.chip}`}>{s.label}</span>
                        <span className="cal-task-time">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {task.time}
                        </span>
                      </div>
                      <h4 className="cal-task-title">{task.title}</h4>
                      {task.desc && <p className="cal-task-desc">{task.desc}</p>}
                      <div className="cal-task-actions">
                        <button onClick={() => openEdit(task)} className="cal-action-btn cal-action-edit">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="cal-action-btn cal-action-delete">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Study Schedule Notes ────────────────────── */}
          <div className="cal-notes-section">
            <div className="cal-notes-header">
              <h4 className="cal-notes-title">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Study Notes
              </h4>
              {!editingNote ? (
                <button onClick={() => setEditingNote(true)} className="cal-notes-edit-btn">Edit</button>
              ) : (
                <button onClick={handleSaveNote} className="cal-notes-save-btn">Save</button>
              )}
            </div>
            {editingNote ? (
              <textarea
                className="cal-notes-textarea"
                placeholder="Write your study schedule notes for this day..."
                value={dayNote}
                onChange={(e) => setNotesData((prev) => ({ ...prev, [selectedDate]: e.target.value }))}
              />
            ) : (
              <p className="cal-notes-display">
                {dayNote || 'No notes for this day. Click Edit to add study notes.'}
              </p>
            )}
          </div>
        </aside>
      </div>

      <TaskModal
        isOpen={modalOpen}
        isEditing={!!editingId}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}