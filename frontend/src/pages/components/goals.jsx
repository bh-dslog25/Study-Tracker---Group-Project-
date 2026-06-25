import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loadUserJSON, saveUserJSON } from '../../utils/storage';
import { recalculateGoalsWithTasks, TASKS_STORAGE_KEY, GOALS_STORAGE_KEY } from '../../utils/goalProgress';
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
  academic: { bg: '#e2dfff', color: '#3323cc', label: 'Học tập' },
  skill:    { bg: '#e7feef', color: '#006c49', label: 'Kỹ năng' },
  personal: { bg: '#fff3e0', color: '#b45309', label: 'Cá nhân' },
  career:   { bg: '#e7eefe', color: '#3525cd', label: 'Sự nghiệp' },
};

const INITIAL_TASKS = [
  { id:1, name:'Complete Practice Test 3', deadline:'2026-06-14', goal:'CS101 Final Exam', priority:'high', description:'Reading Comprehension Section - focus on speed.', done:false },
  { id:2, name:'Review Vocabulary Flashcards', deadline:'2026-06-15', goal:'Weekly Reading Quota', priority:'medium', description:'Sets 10-15, Anki deck.', done:false },
  { id:3, name:'Listen to English Podcast', deadline:'2026-06-16', goal:'Weekly Reading Quota', priority:'low', description:'Episode 42 - Business English.', done:true },
];

const EMPTY_FORM = { title: '', targetDate: '', category: '', description: '', linkedTaskIds: [] };

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
function GoalModal({ isOpen, isEditing, form, setForm, onSave, onCancel, tasks }) {
  if (!isOpen) return null;

  const toggleTask = (taskId) => {
    const id = String(taskId);
    const selected = new Set((form.linkedTaskIds || []).map(String));
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    setForm({ ...form, linkedTaskIds: Array.from(selected) });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Chỉnh sửa Mục tiêu' : 'Thêm Mục tiêu Mới'}</h2>
          <button className="modal-close" onClick={onCancel}><IconClose /></button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="field">
            <label className="field-label">Tên mục tiêu</label>
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
              <label className="field-label">Thời hạn</label>
              <input
                className="field-input"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">Danh mục</label>
              <select
                className="field-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select a category</option>
                <option value="academic">Học tập</option>
                <option value="skill">Kỹ năng</option>
                <option value="personal">Cá nhân</option>
                <option value="career">Sự nghiệp</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Mô tả mục tiêu</label>
            <textarea
              className="field-input field-textarea"
              placeholder="Briefly describe what achieving this goal looks like..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="field-label">Nhiệm vụ trong mục tiêu này</label>
            <div className="goal-task-picker">
              {tasks.length === 0 ? (
                <p className="goal-task-empty">Chưa có nhiệm vụ nào. Tạo nhiệm vụ trước, sau đó gắn chúng vào đây.</p>
              ) : tasks.map((task) => {
                const checked = (form.linkedTaskIds || []).map(String).includes(String(task.id));
                return (
                  <label key={task.id} className={`goal-task-option ${checked ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span>
                      <strong>{task.name}</strong>
                      <small>{task.done ? 'Done' : 'Active'}{task.deadline ? ` - ${task.deadline}` : ''}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Hủy</button>
          <button className="btn-create" onClick={onSave} disabled={!form.title.trim()}>
            {isEditing ? 'Lưu Thay đổi' : 'Tạo Mục tiêu'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Goals Page ────────────────────────────────────────
export default function Goals() {
  const { user } = useAuth();
  const userId = user?.id || user?.email;
  const [goals, setGoals]       = useState(() => loadUserJSON(GOALS_STORAGE_KEY, userId, INITIAL_GOALS));
  const [tasks, setTasks]       = useState(() => loadUserJSON(TASKS_STORAGE_KEY, userId, INITIAL_TASKS));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [menuOpen, setMenuOpen]   = useState(null);

  useEffect(() => {
    const updatedGoals = recalculateGoalsWithTasks(goals, tasks);
    saveUserJSON(GOALS_STORAGE_KEY, userId, updatedGoals);
    if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
      setGoals(updatedGoals);
    }
  }, [goals, tasks, userId]);

  useEffect(() => {
    const onStorage = (e) => {
      if (!e?.detail) return;
      if (e.detail.key === `${TASKS_STORAGE_KEY}__${userId}`) {
        setTasks(loadUserJSON(TASKS_STORAGE_KEY, userId, INITIAL_TASKS));
      }
    };

    window.addEventListener('local-storage', onStorage);
    return () => window.removeEventListener('local-storage', onStorage);
  }, [userId]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditingId(goal.id);
    setForm({
      title: goal.title,
      targetDate: goal.targetDate,
      category: goal.category,
      description: goal.description,
      linkedTaskIds: goal.linkedTaskIds || [],
    });
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
      setGoals((prev) => recalculateGoalsWithTasks(prev.map((g) => g.id === editingId
        ? { ...g, title: form.title, targetDate: form.targetDate, category: form.category, description: form.description, linkedTaskIds: form.linkedTaskIds || [] }
        : g
      ), tasks));
    } else {
      setGoals((prev) => recalculateGoalsWithTasks([...prev, {
        id: Date.now(),
        title: form.title,
        targetDate: form.targetDate,
        category: form.category,
        description: form.description,
        linkedTaskIds: form.linkedTaskIds || [],
        progress: 0,
        completed: false,
      }], tasks));
    }
    setModalOpen(false);
  };

  const toggleLinkedTask = (taskId) => {
    const updatedTasks = tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task);
    const updatedGoals = recalculateGoalsWithTasks(goals, updatedTasks);
    setTasks(updatedTasks);
    setGoals(updatedGoals);
    saveUserJSON(TASKS_STORAGE_KEY, userId, updatedTasks);
    saveUserJSON(GOALS_STORAGE_KEY, userId, updatedGoals);
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
          <h1 className="goals-title">Mục tiêu dài hạn</h1>
          <p className="goals-subtitle">Theo dõi các mục tiêu của bạn.</p>
        </div>
        <button className="btn-new" onClick={openNew}>
          <IconAdd /> Mục tiêu mới
        </button>
      </div>

      {/* ── Grid ────────────────────────────────────── */}
      {goals.length === 0 ? (
        <div className="goals-empty">
          <IconTarget />
          <p>Chưa có mục tiêu nào. Nhấn <strong>Mục tiêu mới</strong> để bắt đầu.</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const cat = CATEGORY_STYLES[goal.category] || CATEGORY_STYLES.personal;
            const linkedTaskIds = new Set((goal.linkedTaskIds || []).map(String));
            const linkedTasks = tasks.filter((task) => linkedTaskIds.has(String(task.id)));
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
                        <button onClick={() => openEdit(goal)}><IconEdit /> Chỉnh sửa</button>
                        <button className="danger" onClick={() => handleDelete(goal.id)}><IconTrash /> Xóa</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title + desc */}
                <h3 className="goal-card-title">{goal.title}</h3>
                {goal.description && <p className="goal-card-desc">{goal.description}</p>}

                <div className="goal-linked-tasks">
                  <div className="goal-linked-head">
                    <span>Các nhiệm vụ liên kết</span>
                    <strong>{linkedTasks.filter((task) => task.done).length}/{linkedTasks.length}</strong>
                  </div>
                  {linkedTasks.length === 0 ? (
                    <p className="goal-linked-empty">Chưa có nhiệm vụ nào được liên kết.</p>
                  ) : linkedTasks.slice(0, 4).map((task) => (
                    <button
                      key={task.id}
                      className={`goal-linked-task ${task.done ? 'done' : ''}`}
                      onClick={() => toggleLinkedTask(task.id)}
                    >
                      <span className="goal-linked-check">{task.done && '✓'}</span>
                      <span>{task.name}</span>
                    </button>
                  ))}
                  {linkedTasks.length > 4 && <p className="goal-linked-more">+{linkedTasks.length - 4} more tasks</p>}
                </div>

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
        tasks={tasks}
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
      />

      {/* Close menu on outside click */}
      {menuOpen && <div className="menu-outside" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
