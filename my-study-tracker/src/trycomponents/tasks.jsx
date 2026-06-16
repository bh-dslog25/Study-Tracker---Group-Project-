import React, { useState, useMemo } from 'react';
import './Tasks.css';

// ── Icons ─────────────────────────────────────────────
const IconAdd    = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;
const IconClose  = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IconDots   = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
const IconEdit   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
const IconTrash  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IconCal    = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IconSearch = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconFilter = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;
const IconCheck  = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>;

// ── Dữ liệu mẫu ──────────────────────────────────────
const INITIAL_TASKS = [
  { id:1, name:'Complete Practice Test 3',      deadline:'2026-06-14', goal:'CS101 Final Exam',    priority:'high',   description:'Reading Comprehension Section — focus on speed.', done:false },
  { id:2, name:'Review Vocabulary Flashcards',  deadline:'2026-06-15', goal:'Weekly Reading Quota',priority:'medium', description:'Sets 10–15, Anki deck.',                          done:false },
  { id:3, name:'Listen to English Podcast',     deadline:'2026-06-16', goal:'Weekly Reading Quota',priority:'low',    description:'Episode 42 — Business English.',                  done:true  },
  { id:4, name:'Write Thesis Outline',          deadline:'2026-06-20', goal:'Thesis Research',     priority:'high',   description:'Chapter 1 & 2 structure.',                        done:false },
  { id:5, name:'Read Chapter 4: Neural Nets',   deadline:'2026-06-18', goal:'CS101 Final Exam',    priority:'medium', description:'',                                                done:false },
  { id:6, name:'Math Problem Set 5',            deadline:'2026-06-13', goal:'CS101 Final Exam',    priority:'high',   description:'Integration by parts exercises.',                 done:true  },
];

const GOALS = ['CS101 Final Exam', 'Thesis Research', 'Weekly Reading Quota'];

const PRIORITY_META = {
  high:   { label:'High',   cls:'pri-high'   },
  medium: { label:'Medium', cls:'pri-medium' },
  low:    { label:'Low',    cls:'pri-low'    },
};

const EMPTY_FORM = { name:'', deadline:'', goal:'', priority:'medium', description:'' };

const fmtDate = (str) => {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
};

const isOverdue = (str, done) => {
  if (!str || done) return false;
  return new Date(str + 'T00:00:00') < new Date(new Date().toDateString());
};

// ── Task Modal ────────────────────────────────────────
function TaskModal({ isOpen, isEditing, form, setForm, onSave, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onCancel}><IconClose /></button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="field">
            <label className="field-label">Task Name</label>
            <input className="field-input" type="text"
              placeholder="e.g., Read Chapter 4: Neural Networks"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Deadline</label>
              <input className="field-input" type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">Goal Association</label>
              <select className="field-input"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              >
                <option value="">Select a goal...</option>
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Priority pills */}
          <div className="field">
            <label className="field-label">Priority</label>
            <div className="priority-pills">
              {['low','medium','high'].map((p) => (
                <button key={p}
                  className={`pill ${p} ${form.priority === p ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, priority: p })}
                  type="button"
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Description (Optional)</label>
            <textarea className="field-input field-textarea"
              placeholder="Add any specific notes, links, or sub-tasks here..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-create" onClick={onSave} disabled={!form.name.trim()}>
            <IconAdd /> {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tasks Page ────────────────────────────────────────
export default function Tasks() {
  const [tasks, setTasks]         = useState(INITIAL_TASKS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [menuOpen, setMenuOpen]   = useState(null);
  const [search, setSearch]       = useState('');
  const [filterPri, setFilterPri] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | done

  // ── CRUD ─────────────────────────────────────────────
  const openNew = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true); };

  const openEdit = (task) => {
    setEditingId(task.id);
    setForm({ name:task.name, deadline:task.deadline, goal:task.goal, priority:task.priority, description:task.description });
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setTasks(prev => prev.map(t => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setTasks(prev => [...prev, { id: Date.now(), ...form, done: false }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this task?')) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    setMenuOpen(null);
  };

  const toggleDone = (id) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  // ── Filtered list ─────────────────────────────────────
  const filtered = useMemo(() => tasks.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                        t.goal.toLowerCase().includes(search.toLowerCase());
    const matchPri    = filterPri === 'all' || t.priority === filterPri;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'done' ? t.done : !t.done);
    return matchSearch && matchPri && matchStatus;
  }), [tasks, search, filterPri, filterStatus]);

  const counts = {
    all:    tasks.length,
    active: tasks.filter(t => !t.done).length,
    done:   tasks.filter(t => t.done).length,
  };

  return (
    <div className="tasks-page">
      {/* ── Header ──────────────────────────────────── */}
      <div className="tasks-header">
        <div>
          <h1 className="tasks-title">Tasks</h1>
          <p className="tasks-subtitle">Manage your study assignments and to-dos.</p>
        </div>
        <button className="btn-new" onClick={openNew}>
          <IconAdd /> New Task
        </button>
      </div>

      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="tasks-toolbar">
        {/* Search */}
        <div className="search-box">
          <IconSearch />
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status tabs */}
        <div className="status-tabs">
          {['all','active','done'].map(s => (
            <button key={s}
              className={`tab-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="tab-count">{counts[s]}</span>
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="filter-box">
          <IconFilter />
          <select value={filterPri} onChange={e => setFilterPri(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* ── Task list ───────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="tasks-empty">
          <p>No tasks found. Try changing filters or <button onClick={openNew}>add a new task</button>.</p>
        </div>
      ) : (
        <div className="task-list">
          {filtered.map(task => {
            const pm = PRIORITY_META[task.priority];
            const overdue = isOverdue(task.deadline, task.done);
            return (
              <div key={task.id} className={`task-item ${task.done ? 'task-done' : ''} ${overdue ? 'task-overdue' : ''}`}>
                {/* Checkbox */}
                <button
                  className={`task-check ${task.done ? 'checked' : ''}`}
                  onClick={() => toggleDone(task.id)}
                >
                  {task.done && <IconCheck />}
                </button>

                {/* Content */}
                <div className="task-content">
                  <div className="task-top">
                    <span className="task-name">{task.name}</span>
                    <div className="task-badges">
                      <span className={`pri-badge ${pm.cls}`}>{pm.label}</span>
                      {overdue && <span className="overdue-badge">Overdue</span>}
                    </div>
                  </div>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  <div className="task-meta">
                    {task.deadline && (
                      <span className={`task-date ${overdue ? 'date-overdue' : ''}`}>
                        <IconCal /> {fmtDate(task.deadline)}
                      </span>
                    )}
                    {task.goal && <span className="task-goal">{task.goal}</span>}
                  </div>
                </div>

                {/* Menu */}
                <div className="task-menu-wrapper">
                  <button className="task-menu-btn"
                    onClick={() => setMenuOpen(menuOpen === task.id ? null : task.id)}>
                    <IconDots />
                  </button>
                  {menuOpen === task.id && (
                    <div className="task-dropdown">
                      <button onClick={() => openEdit(task)}><IconEdit /> Edit</button>
                      <button onClick={() => toggleDone(task.id)}>
                        {task.done ? '↩ Mark Active' : '✓ Mark Done'}
                      </button>
                      <button className="danger" onClick={() => handleDelete(task.id)}>
                        <IconTrash /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ───────────────────────────────────── */}
      <TaskModal
        isOpen={modalOpen}
        isEditing={!!editingId}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
      />

      {menuOpen && <div className="menu-outside" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}