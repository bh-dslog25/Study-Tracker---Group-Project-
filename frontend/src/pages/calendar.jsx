import React, { useState, useMemo } from 'react';
import './Calendar.css';

// ── Helpers ───────────────────────────────────────────
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
  high:       { bg: '#ffdad6', text: '#93000a', bar: '#ba1a1a', chip: 'chip-high',   label: 'High Priority' },
  medium:     { bg: '#6cf8bb', text: '#00714d', bar: '#006c49', chip: 'chip-medium', label: 'Medium' },
  assignment: { bg: '#006a7c', text: '#93e8ff', bar: '#00505f', chip: 'chip-assign', label: 'Assignment' },
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

// ── Icons ─────────────────────────────────────────────
const IconAdd    = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;
const IconClose  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IconEdit   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
const IconTrash  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IconClock  = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconChevL  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>;
const IconChevR  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>;

// ── Task Modal ────────────────────────────────────────
function TaskModal({ isOpen, isEditing, form, setForm, onSave, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="cal-modal-overlay">
      <div className="cal-modal-backdrop" onClick={onCancel} />
      <div className="cal-modal-box">
        <div className="cal-modal-header">
          <h2 className="cal-modal-title">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="cal-modal-close" onClick={onCancel}><IconClose /></button>
        </div>

        <div className="cal-modal-body">
          <input
            className="cal-field"
            type="text"
            placeholder="Task Name (e.g. Read Chapter 4)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <div className="cal-field-row">
            <input
              className="cal-field"
              type="time"
              value={form.time}
              onChange={e => setForm({ ...form, time: e.target.value })}
            />
            <select
              className="cal-field"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <textarea
            className="cal-field cal-textarea"
            placeholder="Description (optional)"
            rows={3}
            value={form.desc}
            onChange={e => setForm({ ...form, desc: e.target.value })}
          />
        </div>

        <div className="cal-modal-footer">
          <button className="cal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="cal-btn-save"
            onClick={onSave}
            disabled={!form.title.trim()}
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────
export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate]   = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [tasksData, setTasksData]       = useState(INITIAL_TASKS);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [form, setForm]                 = useState({ title: '', time: '', priority: 'high', desc: '' });

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ── Calendar grid ─────────────────────────────────
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
      result.push({ type: 'filler-next', day: d });

    return result;
  }, [year, month]);

  // ── Navigation ─────────────────────────────────────
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday   = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDate(today));
  };

  // ── Modal helpers ───────────────────────────────────
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
    if (!form.title.trim()) { alert('Vui lòng nhập tên công việc!'); return; }

    let formattedTime = 'All Day';
    if (form.time) {
      let [h, min] = form.time.split(':');
      h = parseInt(h);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      formattedTime = `${h}:${min} ${ampm}`;
    }

    setTasksData(prev => {
      const list = [...(prev[selectedDate] || [])];
      if (editingId) {
        const idx = list.findIndex(t => t.id === editingId);
        if (idx > -1)
          list[idx] = { id: editingId, title: form.title, time: formattedTime, priority: form.priority, desc: form.desc };
      } else {
        list.push({ id: Date.now(), title: form.title, time: formattedTime, priority: form.priority, desc: form.desc });
      }
      return { ...prev, [selectedDate]: list };
    });
    setModalOpen(false);
  };

  const handleDelete = (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setTasksData(prev => {
      const list = (prev[selectedDate] || []).filter(t => t.id !== taskId);
      const next = { ...prev };
      if (list.length === 0) delete next[selectedDate];
      else next[selectedDate] = list;
      return next;
    });
  };

  // ── Side panel ──────────────────────────────────────
  const selectedObj   = parseDateStr(selectedDate);
  const selectedLabel = selectedObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const dayTasks      = tasksData[selectedDate] || [];

  return (
    <div className="cal-page">

      {/* ── Header ──────────────────────────────────── */}
      <div className="cal-header">
        <div>
          <h1 className="cal-month-title">{MONTH_NAMES[month]} {year}</h1>
          <p className="cal-month-sub">Midterm preparation weeks.</p>
        </div>
        <div className="cal-nav-btns">
          <button className="cal-nav-btn" onClick={prevMonth}><IconChevL /></button>
          <button className="cal-today-btn" onClick={goToday}>Today</button>
          <button className="cal-nav-btn" onClick={nextMonth}><IconChevR /></button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────── */}
      <div className="cal-body">

        {/* Grid */}
        <div className="cal-grid-wrapper">
          {/* Day headers */}
          <div className="cal-day-headers">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="cal-grid">
            {cells.map((cell, idx) => {
              if (cell.type !== 'current') return (
                <div key={`f-${idx}`} className="cal-cell cal-cell-filler">
                  <span className="cal-day-num cal-day-filler">{cell.day}</span>
                </div>
              );

              const isSelected = cell.dateStr === selectedDate;
              const isToday    = cell.dateStr === formatDate(today);
              const cellTasks  = tasksData[cell.dateStr] || [];

              return (
                <div
                  key={cell.dateStr}
                  className={`cal-cell ${isSelected ? 'cal-cell-selected' : ''}`}
                  onClick={() => setSelectedDate(cell.dateStr)}
                >
                  <span className={`cal-day-num ${isToday ? 'cal-day-today' : ''}`}>
                    {cell.day}
                  </span>
                  {cellTasks.map(t => {
                    const s = PRIORITY_STYLES[t.priority];
                    return (
                      <div
                        key={t.id}
                        className={`cal-chip ${s.chip}`}
                        style={{ background: s.bg, color: s.text }}
                      >
                        {t.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <aside className="cal-aside">
          <div className="cal-aside-header">
            <div>
              <h3 className="cal-aside-date">{selectedLabel}</h3>
              <p className="cal-aside-count">
                {dayTasks.length === 0
                  ? '0 items scheduled'
                  : `${dayTasks.length} ${dayTasks.length === 1 ? 'item' : 'items'} scheduled`}
              </p>
            </div>
            <button className="cal-new-btn" onClick={openNew}>
              <IconAdd /> New Task
            </button>
          </div>

          <div className="cal-task-list">
            {dayTasks.length === 0 ? (
              <p className="cal-empty">No tasks scheduled for this day.</p>
            ) : (
              dayTasks.map(task => {
                const s = PRIORITY_STYLES[task.priority];
                return (
                  <div key={task.id} className="cal-task-card">
                    <div className="cal-task-bar" style={{ background: s.bar }} />
                    <div className="cal-task-top">
                      <span className="cal-task-badge" style={{ background: s.bg, color: s.text }}>
                        {s.label}
                      </span>
                      <span className="cal-task-time">
                        <IconClock /> {task.time}
                      </span>
                    </div>
                    <h4 className="cal-task-title">{task.title}</h4>
                    {task.desc && <p className="cal-task-desc">{task.desc}</p>}
                    <div className="cal-task-actions">
                      <button className="cal-action-btn edit" onClick={() => openEdit(task)}>
                        <IconEdit />
                      </button>
                      <button className="cal-action-btn delete" onClick={() => handleDelete(task.id)}>
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {/* Modal */}
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