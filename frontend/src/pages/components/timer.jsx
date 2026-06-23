import React, { useState, useEffect, useRef } from 'react';
import { Square, Play, Pause, SkipForward, Plus, Trash2, X, Clock, ChevronLeft, Pencil, Check } from 'lucide-react';
import { loadJSON, saveJSON } from '../../utils/storage';
import { updateGoalsProgressFromTasks } from '../../utils/goalProgress';
import './Timer.css';

// ── Dữ liệu mẫu ─────────────────────────────────────
const INITIAL_HISTORY = [
  { id: 1, title: 'Algorithms Practice', project: 'CS301', date: 'Today',     start: '09:00 AM', end: '09:45 AM', duration: 45 },
  { id: 2, title: 'Read Chapter 4',      project: 'CS301', date: 'Today',     start: '07:30 AM', end: '08:00 AM', duration: 30 },
  { id: 3, title: 'Math Problem Set',    project: 'MATH2', date: 'Yesterday', start: '03:00 PM', end: '04:15 PM', duration: 75 },
  { id: 4, title: 'English Essay Draft', project: 'ENG1',  date: 'Yesterday', start: '06:00 PM', end: '06:40 PM', duration: 40 },
  { id: 5, title: 'Physics Lab Report',  project: 'PHY1',  date: 'Jun 10',    start: '08:00 AM', end: '09:30 AM', duration: 90 },
];

const INITIAL_SESSIONS = [
  { id: 1, title: 'Read Chapter 4', project: 'CS301', duration: 36 },
];
const TIMER_SESSIONS_KEY = 'study_tracker_timer_sessions';
const TIMER_HISTORY_KEY = 'study_tracker_timer_history';
const TIMER_ACTIVE_KEY = 'study_tracker_timer_active_idx';
const TASKS_STORAGE_KEY = 'study_tracker_tasks';
// ── Helpers ──────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const uid = () => Date.now();
const normalizeText = (value) => String(value || '').trim().toLowerCase();
const getInitialTimerState = () => {
  const sessions = loadJSON(TIMER_SESSIONS_KEY, INITIAL_SESSIONS);
  const storedActiveIdx = loadJSON(TIMER_ACTIVE_KEY, 0);
  const activeIdx = Math.min(storedActiveIdx, Math.max(0, sessions.length - 1));
  const activeSession = sessions[activeIdx] || sessions[0];

  return {
    sessions,
    activeIdx,
    secondsLeft: activeSession ? activeSession.duration * 60 : 0,
  };
};

const markLinkedTaskDone = (session) => {
  const tasks = loadJSON(TASKS_STORAGE_KEY, []);
  const sessionTitle = normalizeText(session.title);
  let changed = false;

  const updatedTasks = tasks.map((task) => {
    const isSameTask = task.id === session.id || normalizeText(task.name) === sessionTitle;
    if (!isSameTask || task.done) return task;
    changed = true;
    return { ...task, done: true };
  });

  if (changed) {
    saveJSON(TASKS_STORAGE_KEY, updatedTasks);
    updateGoalsProgressFromTasks(updatedTasks);
  }
};

// ── Component chính ──────────────────────────────────
export default function Timer() {
  const initialTimerState = useRef(null);
  if (!initialTimerState.current) {
    initialTimerState.current = getInitialTimerState();
  }

  const [sessions, setSessions]           = useState(initialTimerState.current.sessions);
  const [history, setHistory]             = useState(() => loadJSON(TIMER_HISTORY_KEY, INITIAL_HISTORY));
  const [activeIdx, setActiveIdx]         = useState(initialTimerState.current.activeIdx);
  const [secondsLeft, setSecondsLeft]     = useState(initialTimerState.current.secondsLeft);
  const [isRunning, setIsRunning]         = useState(false);
  const [view, setView]                   = useState('timer'); // 'timer' | 'history' | 'add'
  const [newTask, setNewTask]             = useState({ title: '', project: '', duration: 25 });
  // ── State edit thời gian ──
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes]     = useState('');
  const [editSeconds, setEditSeconds]     = useState('');
  const intervalRef = useRef(null);

  // ── Đồng hồ ─────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            finishSession();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const finishSession = () => {
    const cur = sessions[activeIdx];
    if (!cur) return;
    const now = new Date();
    const end = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const startDate = new Date(now - cur.duration * 60000);
    const start = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setHistory((h) => [
      { id: uid(), title: cur.title, project: cur.project, date: 'Today', start, end, duration: cur.duration },
      ...h,
    ]);
    markLinkedTaskDone(cur);
  };

  // ── Đổi session ─────────────────────────────────────
  const selectSession = (idx) => {
    setIsRunning(false);
    setIsEditingTime(false);
    setActiveIdx(idx);
    setSecondsLeft(sessions[idx].duration * 60);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsEditingTime(false);
    setSecondsLeft(sessions[activeIdx]?.duration * 60 || 0);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setIsEditingTime(false);
    const next = (activeIdx + 1) % sessions.length;
    selectSession(next);
  };

  // ── Edit thời gian ────────────────────────────────────
  const openEditTime = () => {
    setEditMinutes(String(Math.floor(secondsLeft / 60)));
    setEditSeconds(String(secondsLeft % 60));
    setIsEditingTime(true);
  };

  const saveEditTime = () => {
    const mins = Math.max(0, parseInt(editMinutes, 10) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(editSeconds, 10) || 0));
    const total = mins * 60 + secs;
    if (total > 0) {
      setSecondsLeft(total);
      setSessions(prev => prev.map((s, idx) =>
        idx === activeIdx ? { ...s, duration: Math.round(total / 60) } : s
      ));
    }
    setIsEditingTime(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') saveEditTime();
    if (e.key === 'Escape') setIsEditingTime(false);
  };

  // ── Thêm session ─────────────────────────────────────
  const handleAdd = () => {
    if (!newTask.title.trim()) return;
    const s = { id: uid(), title: newTask.title, project: newTask.project || '—', duration: Number(newTask.duration) || 25 };
    const updated = [...sessions, s];
    setSessions(updated);
    setNewTask({ title: '', project: '', duration: 25 });
    setView('timer');
    const newIdx = updated.length - 1;
    setActiveIdx(newIdx);
    setSecondsLeft(s.duration * 60);
    setIsRunning(false);
  };

  useEffect(() => {
    saveJSON(TIMER_SESSIONS_KEY, sessions);
  }, [sessions]);

  // Listen for storage changes made elsewhere in the app (same-tab via saveJSON dispatch)
  useEffect(() => {
    const onStorage = (e) => {
      try {
        if (!e?.detail) return;
        if (e.detail.key === TIMER_SESSIONS_KEY) {
          const updated = loadJSON(TIMER_SESSIONS_KEY, []);
          setSessions(updated);
          setActiveIdx((idx) => Math.min(idx, Math.max(0, updated.length - 1)));
          const cur = updated[Math.min(activeIdx, Math.max(0, updated.length - 1))];
          setSecondsLeft(cur ? cur.duration * 60 : 0);
          setIsRunning(false);
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('local-storage', onStorage);
    return () => window.removeEventListener('local-storage', onStorage);
  }, [activeIdx]);

  useEffect(() => {
    saveJSON(TIMER_HISTORY_KEY, history);
  }, [history]);

  useEffect(() => {
    saveJSON(TIMER_ACTIVE_KEY, activeIdx);
  }, [activeIdx]);

  // ── Xóa session ─────────────────────────────────────
  const deleteSession = (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      setSessions([]);
      setActiveIdx(0);
      setSecondsLeft(0);
      setIsRunning(false);
      return;
    }
    setSessions(updated);
    const newIdx = Math.min(activeIdx, updated.length - 1);
    setActiveIdx(newIdx);
    setSecondsLeft(updated[newIdx].duration * 60);
    setIsRunning(false);
  };

  const deleteHistory = (id) => setHistory((h) => h.filter((x) => x.id !== id));

  // ── SVG progress ─────────────────────────────────────
  const cur = sessions[activeIdx];
  const total = cur ? cur.duration * 60 : 1;
  const radius = 110;
  const circ   = 2 * Math.PI * radius;
  const offset = circ * (1 - secondsLeft / total);

  // ── Render ───────────────────────────────────────────
  if (view === 'history') return (
    <HistoryView history={history} onDelete={deleteHistory} onBack={() => setView('timer')} />
  );

  if (view === 'add') return (
    <AddView newTask={newTask} setNewTask={setNewTask} onAdd={handleAdd} onCancel={() => setView('timer')} />
  );

  return (
    <div className="timer-page">
      {/* ── LEFT ────────────────────────────────────── */}
      <div className="timer-main">
        <p className="timer-label">Hiện tại đang làm việc</p>
        <h1 className="timer-task">{cur?.title || 'No session'}</h1>
        {cur && (
          <span className="timer-project">
            <span className="project-dot" />
            Project: {cur.project}
          </span>
        )}

        {/* Circle */}
        <div className="timer-circle-wrapper">
          <svg className="timer-svg" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r={radius} fill="none" stroke="#e8e8f0" strokeWidth="10" />
            {cur && (
              <circle
                cx="130" cy="130" r={radius}
                fill="none"
                stroke="url(#grad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 130 130)"
              />
            )}
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#00e676" />
                <stop offset="100%" stopColor="#69f0ae" />
              </linearGradient>
            </defs>
          </svg>

          <div className="timer-display">
            {isEditingTime ? (
              /* ── Form chỉnh thời gian ── */
              <div className="timer-edit-box">
                <span className="timer-edit-label">Chỉnh thời gian</span>
                <div className="timer-edit-inputs">
                  <div className="timer-edit-field">
                    <input
                      type="number" min="0" max="999"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      autoFocus
                      className="timer-edit-input"
                    />
                    <span className="timer-edit-unit">phút</span>
                  </div>
                  <span className="timer-edit-colon">:</span>
                  <div className="timer-edit-field">
                    <input
                      type="number" min="0" max="59"
                      value={editSeconds}
                      onChange={(e) => setEditSeconds(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="timer-edit-input"
                    />
                    <span className="timer-edit-unit">giây</span>
                  </div>
                </div>
                <div className="timer-edit-actions">
                  <button className="timer-edit-cancel" onClick={() => setIsEditingTime(false)}>Hủy</button>
                  <button className="timer-edit-save" onClick={saveEditTime}>
                    <Check size={13} /> Lưu
                  </button>
                </div>
              </div>
            ) : (
              /* ── Hiển thị đồng hồ bình thường ── */
              <>
                <span className="timer-time">{cur ? fmt(secondsLeft) : '--:--'}</span>
                <span className="timer-session">Session {activeIdx + 1} of {sessions.length}</span>
                {cur && !isRunning && (
                  <button className="timer-edit-btn" onClick={openEditTime} title="Chỉnh thời gian">
                    <Pencil size={11} /> Chỉnh giờ
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button className="ctrl-btn" onClick={handleStop} title="Reset">
            <Square size={18} />
          </button>
          <button
            className="ctrl-btn ctrl-play"
            onClick={() => cur && setIsRunning((r) => !r)}
            title={isRunning ? 'Pause' : 'Play'}
          >
            {isRunning ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
          </button>
          <button className="ctrl-btn" onClick={handleSkip} title="Next session">
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      {/* ── RIGHT ───────────────────────────────────── */}
      <div className="timer-right">

        {/* Sessions queue */}
        <div className="panel">
          <div className="panel-header">
            <h2>Phiên làm việc</h2>
            <button className="icon-btn" onClick={() => setView('add')} title="Thêm session">
              <Plus size={18} />
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="empty-msg">Chưa có phiên nào. Nhấn + để thêm.</p>
          ) : (
            <ul className="session-list">
              {sessions.map((s, idx) => (
                <li
                  key={s.id}
                  className={`session-item ${idx === activeIdx ? 'active' : ''}`}
                  onClick={() => selectSession(idx)}
                >
                  <div className="session-info">
                    <span className="session-title">{s.title}</span>
                    <span className="session-meta">{s.project} · {s.duration}m</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent history */}
        <div className="panel">
          <div className="panel-header">
            <h2>Lịch sử phiên làm việc</h2>
          </div>
          <ul className="history-list">
            {history.slice(0, 3).map((item) => (
              <li key={item.id} className="history-item">
                <div className="history-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3d35d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className="history-info">
                  <span className="history-title">{item.title}</span>
                  <span className="history-time">{item.date}, {item.start} – {item.end}</span>
                </div>
                <span className="history-duration">{item.duration}m</span>
              </li>
            ))}
          </ul>
          <button className="view-all-btn" onClick={() => setView('history')}>
            Xem lịch sử
          </button>
        </div>

      </div>
    </div>
  );
}

// ── History View ─────────────────────────────────────
function HistoryView({ history, onDelete, onBack }) {
  const grouped = history.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const totalMin = history.reduce((s, x) => s + x.duration, 0);

  return (
    <div className="history-page">
      <div className="history-page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={18} /> Back
        </button>
        <h1>Lịch sử phiên làm việc</h1>
        <span className="total-badge">
          <Clock size={13} /> {Math.floor(totalMin / 60)}h {totalMin % 60}m total
        </span>
      </div>

      {history.length === 0 ? (
        <p className="empty-msg">Chưa có lịch sử nào.</p>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="history-group">
            <p className="group-date">{date}</p>
            <ul className="history-full-list">
              {items.map((item) => (
                <li key={item.id} className="history-full-item">
                  <div className="history-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3d35d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="history-info">
                    <span className="history-title">{item.title}</span>
                    <span className="history-time">{item.start} – {item.end} · {item.project}</span>
                  </div>
                  <span className="history-duration">{item.duration}m</span>
                  <button className="delete-btn" onClick={() => onDelete(item.id)} title="Xóa">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

// ── Add Session View ─────────────────────────────────
function AddView({ newTask, setNewTask, onAdd, onCancel }) {
  const presets = [15, 25, 30, 45, 60, 90];

  return (
    <div className="add-page">
      <div className="add-card">
        <div className="add-header">
          <h2>Phiên làm việc mới</h2>
          <button className="icon-btn" onClick={onCancel}><X size={18} /></button>
        </div>

        <label className="field-label">Tên nhiệm vụ *</label>
        <input
          className="field-input"
          placeholder="Ví dụ: Read Chapter 5"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />

        <label className="field-label">Dự án</label>
        <input
          className="field-input"
          placeholder="Ví dụ: CS301"
          value={newTask.project}
          onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
        />

        <label className="field-label">Thời gian tập trung (phút)</label>
        <div className="preset-grid">
          {presets.map((p) => (
            <button
              key={p}
              className={`preset-btn ${newTask.duration === p ? 'selected' : ''}`}
              onClick={() => setNewTask({ ...newTask, duration: p })}
            >
              {p}m
            </button>
          ))}
        </div>
        <input
          className="field-input"
          type="number"
          min="1"
          max="180"
          value={newTask.duration}
          onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })}
        />

        <div className="add-actions">
          <button className="btn-cancel" onClick={onCancel}>Hủy</button>
          <button className="btn-confirm" onClick={onAdd} disabled={!newTask.title.trim()}>
            <Plus size={16} /> Thêm phiên làm việc
          </button>
        </div>
      </div>
    </div>
  );
}
