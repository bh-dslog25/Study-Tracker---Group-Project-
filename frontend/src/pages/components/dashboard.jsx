import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

// ── Data mẫu ─────────────────────────────────────────
const WEEK_DATA = {
  'This Week':  [40, 65, 30, 85, 50, 20, 10],
  'Last Week':  [55, 45, 70, 35, 60, 80, 25],
};

const TASKS = [
  { id: 1, title: 'Complete Practice Test 3',      sub: 'Reading Comprehension Section', priority: 'high',   time: 'Today, 2:00 PM',  done: false },
  { id: 2, title: 'Review Vocabulary Flashcards',  sub: 'Sets 10–15',                    priority: 'medium', time: 'Tomorrow',        done: false },
  { id: 3, title: 'Listen to English Podcast',     sub: 'Episode 42',                    priority: 'low',    time: 'Friday',          done: false },
];

const PRIORITY = {
  high:   { bg: 'badge-high',    label: 'High Priority' },
  medium: { bg: 'badge-medium',  label: 'Medium' },
  low:    { bg: 'badge-low',     label: 'Low' },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── Icons (inline SVG nhỏ gọn) ───────────────────────
const IconClock    = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconCheck    = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/><circle cx="12" cy="12" r="10"/></svg>;
const IconTrend    = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconBell     = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconSchedule = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconDots     = () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
const IconPlay     = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

// ── Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [week, setWeek]     = useState('This Week');
  const [tasks, setTasks]   = useState(TASKS);
  
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: 1, title: 'Task Deadline', message: 'Practice Test 3 is due tomorrow', time: '10 mins ago', read: false },
    { id: 2, title: 'Goal Achieved', message: 'You reached 40 hours of study this week!', time: '2 hours ago', read: false },
  ]);

  const toggleNotif = () => setShowNotif(!showNotif);
  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const barData             = WEEK_DATA[week];
  const todayIdx            = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <div className="dashboard">

      {/* ── Header ──────────────────────────────────── */}
      <header className="dash-header">
        <div>
          <h2 className="dash-title">Welcome back, Scholar</h2>
          <p className="dash-subtitle">Here is your academic overview for today.</p>
        </div>
        <div className="dash-header-actions" style={{ position: 'relative' }}>
          <button className="icon-circle" onClick={toggleNotif} style={{ position: 'relative' }}>
            <IconBell />
            {notifs.some(n => !n.read) && <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>}
          </button>

          {showNotif && (
            <div className="notif-dropdown" style={{ position: 'absolute', top: '50px', right: '50px', background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '300px', zIndex: 100, border: '1px solid #e8e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>Notifications</h3>
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#3525cd', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Mark all read</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifs.map(n => (
                  <div key={n.id} style={{ display: 'flex', flexDirection: 'column', opacity: n.read ? 0.6 : 1, paddingBottom: '8px', borderBottom: '1px solid #f0f0f5' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>{n.title}</span>
                    <span style={{ fontSize: '12px', color: '#4a4a6a', marginTop: '2px' }}>{n.message}</span>
                    <span style={{ fontSize: '10px', color: '#9a9aaa', marginTop: '4px' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="avatar" />
          )}
        </div>
      </header>

      {/* ── Bento grid ──────────────────────────────── */}
      <div className="bento">

        {/* Summary cards */}
        <div className="card summary-card">
          <div className="card-top">
            <div className="card-icon"><IconClock /></div>
            <span className="badge-up">↑ 12%</span>
          </div>
          <h3 className="card-big">42h</h3>
          <p className="card-label">Total Study Hours</p>
        </div>

        <div className="card summary-card">
          <div className="card-top">
            <div className="card-icon"><IconCheck /></div>
          </div>
          <h3 className="card-big">18</h3>
          <p className="card-label">Tasks Completed</p>
        </div>

        <div className="card summary-card">
          <div className="card-top">
            <div className="card-icon"><IconTrend /></div>
          </div>
          <h3 className="card-big">75%</h3>
          <p className="card-label">Current Progress</p>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Weekly chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="card-heading">Weekly Study Activity</h3>
            <select
              className="week-select"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
            >
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="bar-chart">
            {DAYS.map((day, i) => (
              <div key={day} className="bar-col">
                <div className="bar-track">
                  <div
                    className={`bar-fill ${i === todayIdx ? 'bar-today' : ''}`}
                    style={{ height: `${barData[i]}%` }}
                  />
                </div>
                <span className={`bar-label ${i === todayIdx ? 'bar-label-today' : ''}`}>{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Goal */}
        <div className="card goal-card">
          <div className="goal-header">
            <h3 className="card-heading">Current Goal</h3>
            <button className="btn-ghost"><IconDots /></button>
          </div>
          <div className="ring-wrapper">
            <svg viewBox="0 0 120 120" className="ring-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e7eefe" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="#3525cd"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50 * 0.75} ${2 * Math.PI * 50}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="ring-inner">
              <span className="ring-pct">75%</span>
              <span className="ring-sub">Completed</span>
            </div>
          </div>
          <h4 className="goal-name">TOEIC 850</h4>
          <p className="goal-date">Target date: Oct 15</p>
        </div>

        {/* Upcoming Tasks */}
        <div className="card tasks-card">
          <div className="tasks-header">
            <h3 className="card-heading">Upcoming Tasks</h3>
            <button className="btn-link">View All</button>
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.done ? 'task-done' : ''}`}>
                <div className="task-left">
                  <button
                    className={`task-check ${task.done ? 'checked' : ''}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.done && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
                  </button>
                  <div>
                    <p className="task-title">{task.title}</p>
                    <p className="task-sub">{task.sub}</p>
                  </div>
                </div>
                <div className="task-right">
                  <span className={`badge ${PRIORITY[task.priority].bg}`}>
                    {PRIORITY[task.priority].label}
                  </span>
                  <span className="task-time">
                    <IconSchedule /> {task.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}