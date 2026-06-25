import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loadJSON, loadUserJSON, saveUserJSON } from '../../utils/storage';
import './dashboard.css';

const TASKS_STORAGE_KEY = 'study_tracker_tasks';
const GOALS_STORAGE_KEY = 'study_tracker_goals';
const CALENDAR_TASKS_KEY = 'study_tracker_calendar_tasks';
const TIMER_SESSIONS_KEY = 'study_tracker_timer_sessions';
const TIMER_HISTORY_KEY = 'study_tracker_timer_history';
const DASHBOARD_NOTIFS_KEY = 'study_tracker_dashboard_notifs';
const DASHBOARD_GOAL_KEY = 'study_tracker_dashboard_current_goal';
const USAGE_TOTAL_KEY = 'study_tracker_usage_total_seconds';
const USAGE_DAILY_KEY = 'study_tracker_usage_daily_seconds';

const INITIAL_TASKS = [
  { id: 1, name: 'Complete Practice Test 3', deadline: '2026-06-14', goal: 'CS101 Final Exam', priority: 'high', description: 'Reading Comprehension Section', done: false },
  { id: 2, name: 'Review Vocabulary Flashcards', deadline: '2026-06-15', goal: 'Weekly Reading Quota', priority: 'medium', description: 'Sets 10-15, Anki deck.', done: false },
  { id: 3, name: 'Listen to English Podcast', deadline: '2026-06-16', goal: 'Weekly Reading Quota', priority: 'low', description: 'Episode 42 - Business English.', done: true },
];

const INITIAL_GOALS = [
  { id: 1, title: 'TOEIC 850', category: 'academic', targetDate: '2026-10-15', description: 'Achieve TOEIC score of 850.', progress: 75 },
  { id: 2, title: 'Master Data Analysis', category: 'skill', targetDate: '2026-12-31', description: 'Complete Python data analysis course.', progress: 40 },
];

const PRIORITY = {
  high: { bg: 'badge-high', label: 'High Priority' },
  medium: { bg: 'badge-medium', label: 'Medium' },
  low: { bg: 'badge-low', label: 'Low' },
  assignment: { bg: 'badge-medium', label: 'Assignment' },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const IconClock = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
const IconCheck = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /><circle cx="12" cy="12" r="10" /></svg>;
const IconTrend = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const IconBell = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const IconSchedule = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
const IconPlay = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const IconCalendar = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;

const todayKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const formatDate = (str) => {
  if (!str) return 'No date';
  const d = new Date(`${str}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatHours = (seconds) => {
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)}m`;
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
};

const formatGoalDate = (str) => {
  if (!str) return 'No target date';
  const d = new Date(`${str}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getCurrentWeekKeys = () => {
  const now = new Date();
  const mondayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = addDays(now, mondayOffset);
  return DAYS.map((_, index) => todayKey(addDays(monday, index)));
};

const sortByDate = (items) => [...items].sort((a, b) => {
  const aTime = a.date ? new Date(`${a.date}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
  const bTime = b.date ? new Date(`${b.date}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
  return aTime - bTime;
});

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id || user?.email;
  const [tasks, setTasks] = useState(() => loadUserJSON(TASKS_STORAGE_KEY, userId, INITIAL_TASKS));
  const [goals, setGoals] = useState(() => loadUserJSON(GOALS_STORAGE_KEY, userId, INITIAL_GOALS));
  const [calendarTasks, setCalendarTasks] = useState(() => loadUserJSON(CALENDAR_TASKS_KEY, userId, {}));
  const [sessions, setSessions] = useState(() => loadUserJSON(TIMER_SESSIONS_KEY, userId, []));
  const [history, setHistory] = useState(() => loadUserJSON(TIMER_HISTORY_KEY, userId, []));
  const [usageTotal, setUsageTotal] = useState(() => Number(localStorage.getItem(USAGE_TOTAL_KEY) || 0));
  const [dailyUsage, setDailyUsage] = useState(() => loadJSON(USAGE_DAILY_KEY, {}));
  const [selectedGoalId, setSelectedGoalId] = useState(() => loadUserJSON(DASHBOARD_GOAL_KEY, userId, null));
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState(() => loadUserJSON(DASHBOARD_NOTIFS_KEY, userId, [
    { id: 1, title: 'Dashboard synced', message: 'Tasks, goals, calendar and timer are linked here.', time: 'Now', read: false },
  ]));

  useEffect(() => {
    const syncDashboardData = () => {
      setTasks(loadUserJSON(TASKS_STORAGE_KEY, userId, INITIAL_TASKS));
      setGoals(loadUserJSON(GOALS_STORAGE_KEY, userId, INITIAL_GOALS));
      setCalendarTasks(loadUserJSON(CALENDAR_TASKS_KEY, userId, {}));
      setSessions(loadUserJSON(TIMER_SESSIONS_KEY, userId, []));
      setHistory(loadUserJSON(TIMER_HISTORY_KEY, userId, []));
    };

    const syncUsage = () => {
      setUsageTotal(Number(localStorage.getItem(USAGE_TOTAL_KEY) || 0));
      setDailyUsage(loadJSON(USAGE_DAILY_KEY, {}));
    };

    const onLocalStorage = (event) => {
      if (!event?.detail?.key) return;
      syncDashboardData();
    };

    window.addEventListener('local-storage', onLocalStorage);
    window.addEventListener('storage', syncDashboardData);
    window.addEventListener('study-usage-update', syncUsage);

    return () => {
      window.removeEventListener('local-storage', onLocalStorage);
      window.removeEventListener('storage', syncDashboardData);
      window.removeEventListener('study-usage-update', syncUsage);
    };
  }, [userId]);

  useEffect(() => {
    if (!goals.length) return;
    const exists = goals.some((goal) => String(goal.id) === String(selectedGoalId));
    if (!exists) setSelectedGoalId(goals[0].id);
  }, [goals, selectedGoalId]);

  useEffect(() => {
    saveUserJSON(DASHBOARD_GOAL_KEY, userId, selectedGoalId);
  }, [selectedGoalId, userId]);

  useEffect(() => {
    saveUserJSON(DASHBOARD_NOTIFS_KEY, userId, notifs);
  }, [notifs, userId]);

  const selectedGoal = goals.find((goal) => String(goal.id) === String(selectedGoalId)) || goals[0];
  const selectedGoalTaskIds = new Set((selectedGoal?.linkedTaskIds || []).map(String));
  const selectedGoalTasks = tasks.filter((task) => selectedGoalTaskIds.has(String(task.id)));
  const completedTasks = tasks.filter((task) => task.done).length;
  const activeTasks = tasks.filter((task) => !task.done).length;
  const currentProgress = selectedGoal?.progress ?? 0;
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const weekKeys = useMemo(() => getCurrentWeekKeys(), []);
  const weeklySeconds = weekKeys.map((key) => Number(dailyUsage[key] || 0));
  const maxWeeklySeconds = Math.max(...weeklySeconds, 3600);
  const unreadNotifs = notifs.some((notif) => !notif.read);

  const upcomingItems = useMemo(() => {
    const taskItems = tasks
      .filter((task) => !task.done)
      .map((task) => ({
        id: `task-${task.id}`,
        source: 'task',
        rawId: task.id,
        title: task.name,
        sub: task.description || task.goal || 'Task',
        priority: task.priority || 'medium',
        date: task.deadline,
        done: task.done,
      }));

    const calendarItems = Object.entries(calendarTasks).flatMap(([date, items]) =>
      (items || []).map((item) => ({
        id: `calendar-${date}-${item.id}`,
        source: 'calendar',
        title: item.title,
        sub: item.desc || 'Calendar event',
        priority: item.priority || 'medium',
        date,
        time: item.time,
        done: false,
      }))
    );

    return sortByDate([...taskItems, ...calendarItems]).slice(0, 6);
  }, [tasks, calendarTasks]);

  const todayCalendar = calendarTasks[todayKey()] || [];
  const activeSession = sessions[0];
  const recentHistory = history.slice(0, 3);

  const toggleNotif = () => setShowNotif((show) => !show);
  const markAllRead = () => setNotifs((prev) => prev.map((notif) => ({ ...notif, read: true })));

  const toggleTask = (id) => {
    const nextTasks = tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task);
    setTasks(nextTasks);
    saveUserJSON(TASKS_STORAGE_KEY, userId, nextTasks);
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h2 className="dash-title">Chào mừng quay lại, {user?.name || 'bạn tôi'}</h2>
          <p className="dash-subtitle">Hãy cùng nhau theo dõi tiến độ học tập của bạn!</p>
        </div>
        <div className="dash-header-actions">
          <button className="icon-circle" onClick={toggleNotif} style={{ position: 'relative' }}>
            <IconBell />
            {unreadNotifs && <span className="notif-dot" />}
          </button>

          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-head">
                <h3>Thông báo</h3>
                <button onClick={markAllRead}>Đánh dấu tất cả là đã đọc</button>
              </div>
              <div className="notif-list">
                {notifs.map((notif) => (
                  <div key={notif.id} className={`notif-item ${notif.read ? 'read' : ''}`}>
                    <span className="notif-title">{notif.title}</span>
                    <span className="notif-message">{notif.message}</span>
                    <span className="notif-time">{notif.time}</span>
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

      <div className="quick-actions">
        <Link to="/tasks">Nhiệm vụ</Link>
        <Link to="/time-tracker">Theo dõi thời gian</Link>
        <Link to="/goals">Mục tiêu</Link>
        <Link to="/calendar">Lịch</Link>
      </div>

      <div className="bento">
        <div className="card summary-card">
          <div className="card-top">
            <div className="card-icon"><IconClock /></div>
            <span className="badge-up">Live</span>
          </div>
          <h3 className="card-big">{formatHours(usageTotal)}</h3>
          <p className="card-label">Tổng số giờ học</p>
        </div>

        <div className="card summary-card">
          <div className="card-top">
            <div className="card-icon"><IconCheck /></div>
          </div>
          <h3 className="card-big">{completedTasks}</h3>
          <p className="card-label">Nhiệm vụ đã hoàn thành</p>
          
        </div>

        <div className="card summary-card">
          <div className="card-top">
            <div className="card-icon"><IconTrend /></div>
          </div>
          <h3 className="card-big">{currentProgress}%</h3>
          <p className="card-label">Tiến độ hiện tại</p>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${currentProgress}%` }} />
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="card-heading">Hoạt động học tập hàng tuần</h3>
              <p className="section-subtitle">Tính toán từ khi bắt đầu.</p>
            </div>
            <span className="week-pill">Tuần này</span>
          </div>
          <div className="bar-chart">
            {DAYS.map((day, index) => {
              const seconds = weeklySeconds[index];
              const height = Math.max(4, Math.round((seconds / maxWeeklySeconds) * 100));
              return (
                <div key={day} className="bar-col">
                  <div className="bar-track">
                    <div className={`bar-fill ${index === todayIdx ? 'bar-today' : ''}`} style={{ height: `${height}%` }} />
                  </div>
                  <span className={`bar-label ${index === todayIdx ? 'bar-label-today' : ''}`}>{day}</span>
                  <span className="bar-value">{formatHours(seconds)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card current-goal-card">
          <div className="goal-header">
            <h3 className="card-heading">Mục tiêu hiện tại</h3>
            <select className="goal-select" value={selectedGoal?.id || ''} onChange={(event) => setSelectedGoalId(event.target.value)}>
              {goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
            </select>
          </div>
          {selectedGoal ? (
            <>
              <div className="ring-wrapper">
                <svg viewBox="0 0 120 120" className="ring-svg">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e7eefe" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="#3525cd"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50 * currentProgress / 100} ${2 * Math.PI * 50}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="ring-inner">
                  <span className="ring-pct">{currentProgress}%</span>
                  <span className="ring-sub">Đã hoàn thành</span>
                </div>
              </div>
              <h4 className="goal-name">{selectedGoal.title}</h4>
              <p className="goal-date">Thời hạn: {formatGoalDate(selectedGoal.targetDate)}</p>
              <p className="goal-date">
                Nhiệm vụ: {selectedGoalTasks.filter((task) => task.done).length}/{selectedGoalTasks.length || 0} đã hoàn thành
              </p>
              <Link className="card-link" to="/goals">Chỉnh sửa mục tiêu</Link>
            </>
          ) : (
            <div className="empty-panel">
              <p>Chưa có mục tiêu nào.</p>
              <Link to="/goals">Tạo một mục tiêu</Link>
            </div>
          )}
        </div>

        <div className="card focus-card">
          <div className="tasks-header">
            <h3 className="card-heading">Thời gian tập trung</h3>
            <Link className="btn-link" to="/time-tracker">Mở</Link>
          </div>
          {activeSession ? (
            <div className="focus-session">
              <div className="focus-play"><IconPlay /></div>
              <div>
                <p className="focus-title">{activeSession.title}</p>
                <p className="focus-sub">{activeSession.project || 'No project'} - {activeSession.duration}m session</p>
              </div>
            </div>
          ) : (
            <p className="empty-text">Chưa có phiên làm việc nào.</p>
          )}
          <div className="mini-history">
            {recentHistory.map((item) => (
              <div key={item.id} className="mini-history-row">
                <span>{item.title}</span>
                <strong>{item.duration}m</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card calendar-card">
          <div className="tasks-header">
            <h3 className="card-heading">Lịch hôm nay</h3>
            <Link className="btn-link" to="/calendar">Mở</Link>
          </div>
          {todayCalendar.length ? todayCalendar.slice(0, 4).map((item) => (
            <div key={item.id} className="calendar-row">
              <span className="calendar-icon"><IconCalendar /></span>
              <div>
                <p>{item.title}</p>
                <span>{item.time || 'All Day'}</span>
              </div>
            </div>
          )) : <p className="empty-text">Không có công việc nào trong lịch hôm nay.</p>}
        </div>

        <div className="card tasks-card">
          <div className="tasks-header">
            <h3 className="card-heading">Công việc sắp tới</h3>
            <Link className="btn-link" to="/tasks">Xem tất cả</Link>
          </div>
          <div className="task-list">
            {upcomingItems.length ? upcomingItems.map((task) => {
              const priority = PRIORITY[task.priority] || PRIORITY.medium;
              return (
                <div key={task.id} className={`task-item ${task.done ? 'task-done' : ''}`}>
                  <div className="task-left">
                    {task.source === 'task' ? (
                      <button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggleTask(task.rawId)}>
                        {task.done && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>}
                      </button>
                    ) : (
                      <span className="calendar-dot"><IconCalendar /></span>
                    )}
                    <div>
                      <p className="task-title">{task.title}</p>
                      <p className="task-sub">{task.sub}</p>
                    </div>
                  </div>
                  <div className="task-right">
                    <span className={`badge ${priority.bg}`}>{priority.label}</span>
                    <span className="task-time"><IconSchedule /> {task.time || formatDate(task.date)}</span>
                  </div>
                </div>
              );
            }) : <p className="empty-text">Không có công việc nào sắp tới.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
