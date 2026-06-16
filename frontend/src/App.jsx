import React from 'react';
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

const isAuthenticated = () => {
  return Boolean(
    localStorage.getItem('isLoggedIn') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('access_token')
  );
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
