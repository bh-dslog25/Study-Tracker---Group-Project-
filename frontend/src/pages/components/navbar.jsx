import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Icon = ({ children }) => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    {children}
  </svg>
);

const LayoutDashboard = () => (
  <Icon>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Icon>
);

const ListTodo = () => (
  <Icon>
    <path d="m3 6 2 2 4-4" />
    <path d="M11 6h10" />
    <path d="m3 14 2 2 4-4" />
    <path d="M11 14h10" />
    <path d="M11 21h10" />
  </Icon>
);

const Clock = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

const Target = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </Icon>
);

const Calendar = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 10h18" />
  </Icon>
);

const Settings = () => (
  <Icon>
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
);

const LogOut = () => (
  <Icon>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);

const mainNavItems = [
  { name: 'Dashboard',    path: '/',             icon: <LayoutDashboard /> },
  { name: 'Tasks',        path: '/tasks',        icon: <ListTodo /> },
  { name: 'Time Tracker', path: '/time-tracker', icon: <Clock /> },
  { name: 'Goals',        path: '/goals',        icon: <Target /> },
  { name: 'Calendar',     path: '/calendar',     icon: <Calendar /> },
];

const Navbar = () => {
  const location = useLocation();

  const handleLogout = () => {
    // Xóa tất cả dữ liệu user trong localStorage
    try {
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const userId = user.id || user.email;
        if (userId) {
          // Xóa tất cả keys có chứa userId
          const suffix = `__${userId}`;
          Object.keys(localStorage)
            .filter((k) => k.endsWith(suffix))
            .forEach((k) => localStorage.removeItem(k));
        }
      }
    } catch (e) {
      console.warn('Could not clear user data:', e);
    }
    
    // Xóa auth keys
    localStorage.removeItem('user_info');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isLoggedIn');
    
    // Redirect ngay lập tức
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="brand-avatar">ST</div>
        <div className="brand-text">
          <span className="brand-name">StudyTracker</span>
          <span className="brand-subtitle">Deep Work Mode</span>
        </div>
      </div>

      {/* Nav chính */}
      <ul className="sidebar-nav">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Bottom: Settings */}
      <div className="sidebar-bottom">
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ border: 'none', textAlign: 'left', cursor: 'pointer', padding: '11px 14px' }}
        >
          <span className="nav-icon" style={{ color: '#ef4444' }}><LogOut /></span>
          <span className="nav-text" style={{ color: '#ef4444', fontWeight: 'bold' }}>Log out</span>
        </button>

        <Link
          to="/settings"
          className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          <span className="nav-icon"><Settings /></span>
          <span className="nav-text">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Navbar;