import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  Target,
  Calendar,
  Settings,
} from 'lucide-react';
import './Navbar.css';

const mainNavItems = [
  { name: 'Dashboard',    path: '/',             icon: <LayoutDashboard size={20} /> },
  { name: 'Tasks',        path: '/tasks',        icon: <ListTodo size={20} /> },
  { name: 'Time Tracker', path: '/time-tracker', icon: <Clock size={20} /> },
  { name: 'Goals',        path: '/goals',        icon: <Target size={20} /> },
  { name: 'Calendar',     path: '/calendar',     icon: <Calendar size={20} /> },
];

const Navbar = () => {
  const location = useLocation();

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
        <Link
          to="/settings"
          className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          <span className="nav-icon"><Settings size={20} /></span>
          <span className="nav-text">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Navbar;