import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import Navbar from './pages/components/Navbar';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import Timer from './pages/components/Timer';
import Calendar from './pages/components/Calendar';
import Dashboard from './pages/components/Dashboard';
import Goals from './pages/components/Goals';
import Tasks from './pages/components/Tasks';
import Settings from './pages/components/Settings';

const USAGE_TOTAL_KEY = 'study_tracker_usage_total_seconds';
const USAGE_DAILY_KEY = 'study_tracker_usage_daily_seconds';

const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem('isLoggedIn') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('access_token')
  );
};

const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const addUsageSeconds = (seconds) => {
  if (!seconds) return;
  const total = Number(localStorage.getItem(USAGE_TOTAL_KEY) || 0) + seconds;
  const daily = readJSON(USAGE_DAILY_KEY, {});
  const today = getLocalDateKey();

  daily[today] = Number(daily[today] || 0) + seconds;
  localStorage.setItem(USAGE_TOTAL_KEY, String(total));
  localStorage.setItem(USAGE_DAILY_KEY, JSON.stringify(daily));
  window.dispatchEvent(new CustomEvent('study-usage-update'));
};

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function DashboardLayout() {
  const location = useLocation();
  const hideNav = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    if (hideNav || !isAuthenticated()) return undefined;

    let lastSeen = Date.now();

    const flushUsage = (force = false) => {
      if (document.hidden && !force) return;
      const now = Date.now();
      const seconds = Math.floor((now - lastSeen) / 1000);
      lastSeen = now;

      if (seconds > 0 && seconds < 300) {
        addUsageSeconds(seconds);
      }
    };

    const intervalId = window.setInterval(() => flushUsage(), 10000);
    const handleVisibility = () => {
      if (document.hidden) flushUsage(true);
      else lastSeen = Date.now();
    };
    const handleBeforeUnload = () => flushUsage(true);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      flushUsage(true);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hideNav]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f0f7' }}>
      {!hideNav && <Navbar />}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/time-tracker"
            element={
              <ProtectedRoute>
                <Timer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <DashboardLayout />
    </Router>
  );
}
