import React, { useState, useEffect, useRef } from 'react';
import { Square, Play, Pause, SkipForward, Plus, Trash2, X, Clock, ChevronLeft } from 'lucide-react';
import './Timer.css';

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

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const uid = () => Date.now();

export default function TimeTracker() {
  const [sessions, setSessions]       = useState(INITIAL_SESSIONS);
  const [history, setHistory]         = useState(INITIAL_HISTORY);
  const [activeIdx, setActiveIdx]     = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SESSIONS[0].duration * 60);
  const [isRunning, setIsRunning]     = useState(false);
  const [view, setView]               = useState('timer');
  const [newTask, setNewTask]         = useState({ title: '', project: '', duration: 25 });
  const intervalRef = useRef(null);

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
  };

  const selectSession = (idx) => {
    setIsRunning(false);
    setActiveIdx(idx);
    setSecondsLeft(sessions[idx].duration * 60);
  };

  const handleStop = () => {
    setIsRunning(false);
    setSecondsLeft(sessions[activeIdx]?.duration * 60 || 0);
  };

  const handleSkip = () => {
    setIsRunning(false);
    const next = (activeIdx + 1) % sessions.length;
    selectSession(next);
  };

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

  const cur = sessions[activeIdx];
  const total = cur ? cur.duration * 60 : 1;
  const radius = 130;
  const circ   = 2 * Math.PI * radius;
  const offset = circ * (1 - secondsLeft / total);

  if (view === 'history') return (
    <HistoryView history={history} onDelete={deleteHistory} onBack={() => setView('timer')} />
  );

  if (view === 'add') return (
    <AddView newTask={newTask} setNewTask={setNewTask} onAdd={handleAdd} onCancel={() => setView('timer')} />
  );

  return (
    <div className="timer-page">
      <div className="timer-main">
        <p className="timer-label">CURRENTLY WORKING ON</p>
        <h1 className="timer-task">{cur?.title || 'No session'}</h1>
        {cur && (
          <span className="timer-project">
            <span className="project-dot" />
            Project: {cur.project}
          </span>
        )}

        <div className="timer-circle-wrapper">
          <svg className="timer-svg" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r={radius} fill="none" stroke="#e8e8f0" strokeWidth="12" />
            {cur && (
              <circle
                cx="150" cy="150" r={radius}
                fill="none"
                stroke="url(#grad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 150 150)"
                className="timer-progress-ring"
              />
            )}
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          <div className="timer-display">
            <span className="timer-time">{cur ? fmt(secondsLeft) : '--:--'}</span>
            <span className="timer-session">
              Session {activeIdx + 1} of {sessions.length}
            </span>
          </div>
        </div>

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

      <div className="timer-right">
        <div className="panel">
          <div className="panel-header">
            <h2>Sessions</h2>
            <button className="icon-btn" onClick={() => setView('add')} title="Add session">
              <Plus size={18} />
            </button>
          </div>
          {sessions.length === 0 ? (
            <p className="empty-msg">No sessions yet. Click + to add.</p>
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
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Session History</h2>
          </div>
          <ul className="history-list">
            {history.slice(0, 3).map((item) => (
              <li key={item.id} className="history-item">
                <div className="history-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
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
            View All History
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <h1>Session History</h1>
        <span className="total-badge">
          <Clock size={13} /> {Math.floor(totalMin / 60)}h {totalMin % 60}m total
        </span>
      </div>
      {history.length === 0 ? (
        <p className="empty-msg">No history yet.</p>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="history-group">
            <p className="group-date">{date}</p>
            <ul className="history-full-list">
              {items.map((item) => (
                <li key={item.id} className="history-full-item">
                  <div className="history-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="history-info">
                    <span className="history-title">{item.title}</span>
                    <span className="history-time">{item.start} – {item.end} · {item.project}</span>
                  </div>
                  <span className="history-duration">{item.duration}m</span>
                  <button className="delete-btn" onClick={() => onDelete(item.id)} title="Delete">
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

function AddView({ newTask, setNewTask, onAdd, onCancel }) {
  const presets = [15, 25, 30, 45, 60, 90];

  return (
    <div className="add-page">
      <div className="add-card">
        <div className="add-header">
          <h2>New Session</h2>
          <button className="icon-btn" onClick={onCancel}><X size={18} /></button>
        </div>
        <label className="field-label">Task name *</label>
        <input
          className="field-input"
          placeholder="e.g. Read Chapter 5"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <label className="field-label">Project</label>
        <input
          className="field-input"
          placeholder="e.g. CS301"
          value={newTask.project}
          onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
        />
        <label className="field-label">Duration (minutes)</label>
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
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-confirm" onClick={onAdd} disabled={!newTask.title.trim()}>
            <Plus size={16} /> Add Session
          </button>
        </div>
      </div>
    </div>
  );
}