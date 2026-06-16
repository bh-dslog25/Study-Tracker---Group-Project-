import React, { useState } from 'react';
import './Goals.css';

// ── Icons ─────────────────────────────────────────────
const IconAdd     = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;
const IconClose   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IconDots    = () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
const IconTarget  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconCal     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IconEdit    = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
const IconTrash   = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;

// ── Dữ liệu mẫu ──────────────────────────────────────
const INITIAL_GOALS = [
  { id: 1, title: 'TOEIC 850',           category: 'academic', targetDate: '2026-10-15', description: 'Achieve TOEIC score of 850 to qualify for international internship programs.', progress: 75 },
  { id: 2, title: 'Master Data Analysis',category: 'skill',    targetDate: '2026-12-31', description: 'Complete Python data analysis course and build 3 portfolio projects.', progress: 40 },
  { id: 3, title: 'Graduate with Honors',category: 'academic', targetDate: '2027-06-01', description: 'Maintain GPA above 3.7 throughout final two semesters.', progress: 60 },
  { id: 4, title: 'Build Portfolio Site', category: 'career',  targetDate: '2026-08-01', description: 'Design and deploy a personal portfolio website showcasing projects.', progress: 20 },
];

const CATEGORY_STYLES = {
  academic: { bg: '#e2dfff', color: '#3323cc', label: 'Academic' },
  skill:    { bg: '#e7feef', color: '#006c49', label: 'Skill' },
  personal: { bg: '#fff3e0', color: '#b45309', label: 'Personal' },
  career:   { bg: '#e7eefe', color: '#3525cd', label: 'Career' },
};

const EMPTY_FORM = { title: '', targetDate: '', category: '', description: '' };

// ── Progress Ring SVG ─────────────────────────────────
function ProgressRing({ pct, size = 80 }) {
  const r   = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e7eefe" strokeWidth="8"/>
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke="#3525cd" strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circ * pct / 100} ${circ}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize="13" fontWeight="700" fill="#151c27">{pct}%</text>
    </svg>
  );
}

// ── Modal ─────────────────────────────────────────────
function GoalModal({ isOpen, isEditing, form, setForm, onSave, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Goal' : 'Add New Goal'}</h2>
          <button className="modal-close" onClick={onCancel}><IconClose /></button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="field">
            <label className="field-label">Goal Title</label>
            <input
              className="field-input"
              type="text"
              placeholder="e.g., Master Data Analysis"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Target Date</label>
              <input
                className="field-input"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">Category</label>
              <select
                className="field-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select a category</option>
                <option value="academic">Academic</option>
                <option value="skill">Skill</option>
                <option value="personal">Personal</option>
                <option value="career">Career</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Objective Description</label>
            <textarea
              className="field-input field-textarea"
              placeholder="Briefly describe what achieving this goal looks like..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {isEditing && (
            <div className="field">
              <label className="field-label">Current Progress ({form.progress ?? 0}%)</label>
              <input
                type="range" min="0" max="100"
                className="field-range"
                value={form.progress ?? 0}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-create" onClick={onSave} disabled={!form.title.trim()}>
            {isEditing ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Goals Page ────────────────────────────────────────
export default function Goals() {
  const [goals, setGoals]       = useState(INITIAL_GOALS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [menuOpen, setMenuOpen]   = useState(null);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditingId(goal.id);
    setForm({ title: goal.title, targetDate: goal.targetDate, category: goal.category, description: goal.description, progress: goal.progress });
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this goal?')) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setMenuOpen(null);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      setGoals((prev) => prev.map((g) => g.id === editingId
        ? { ...g, title: form.title, targetDate: form.targetDate, category: form.category, description: form.description, progress: form.progress ?? g.progress }
        : g
      ));
    } else {
      setGoals((prev) => [...prev, {
        id: Date.now(),
        title: form.title,
        targetDate: form.targetDate,
        category: form.category,
        description: form.description,
        progress: 0,
      }]);
    }
    setModalOpen(false);
  };

  const formatDate = (str) => {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="goals-page">
      {/* ── Header ──────────────────────────────────── */}
      <div className="goals-header">
        <div>
          <h1 className="goals-title">Long-Term Goals</h1>
          <p className="goals-subtitle">Track your overarching academic and personal objectives.</p>
        </div>
        <button className="btn-new" onClick={openNew}>
          <IconAdd /> New Goal
        </button>
      </div>

      {/* ── Grid ────────────────────────────────────── */}
      {goals.length === 0 ? (
        <div className="goals-empty">
          <IconTarget />
          <p>No goals yet. Click <strong>New Goal</strong> to get started.</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const cat = CATEGORY_STYLES[goal.category] || CATEGORY_STYLES.personal;
            return (
              <div key={goal.id} className="goal-card">
                {/* Card header */}
                <div className="goal-card-top">
                  <span className="goal-badge" style={{ background: cat.bg, color: cat.color }}>
                    {cat.label}
                  </span>
                  <div className="goal-menu-wrapper">
                    <button className="goal-menu-btn" onClick={() => setMenuOpen(menuOpen === goal.id ? null : goal.id)}>
                      <IconDots />
                    </button>
                    {menuOpen === goal.id && (
                      <div className="goal-dropdown">
                        <button onClick={() => openEdit(goal)}><IconEdit /> Edit</button>
                        <button className="danger" onClick={() => handleDelete(goal.id)}><IconTrash /> Delete</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title + desc */}
                <h3 className="goal-card-title">{goal.title}</h3>
                {goal.description && <p className="goal-card-desc">{goal.description}</p>}

                {/* Footer */}
                <div className="goal-card-footer">
                  <div className="goal-card-meta">
                    <span className="goal-date"><IconCal /> {formatDate(goal.targetDate)}</span>
                  </div>
                  <ProgressRing pct={goal.progress} size={72} />
                </div>

                {/* Progress bar */}
                <div className="goal-progress-track">
                  <div className="goal-progress-fill" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ───────────────────────────────────── */}
      <GoalModal
        isOpen={modalOpen}
        isEditing={!!editingId}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
      />

      {/* Close menu on outside click */}
      {menuOpen && <div className="menu-outside" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}