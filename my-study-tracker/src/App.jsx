import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Timer from './components/Timer';
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function Layout() {
  const location = useLocation();
  const hideNav  = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app-container">
      {!hideNav && <Navbar />}
      <main className={hideNav ? 'main-content-full' : 'main-content'}>
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/"             element={<Dashboard />} />
          <Route path="/tasks"        element={<Tasks />} />
          <Route path="/time-tracker" element={<Timer />} />
          <Route path="/goals"        element={<Goals />} />
          <Route path="/calendar"     element={<Calendar />} />
          <Route path="/settings"     element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => (
  <Router>
    <Layout />
  </Router>
);

export default App;