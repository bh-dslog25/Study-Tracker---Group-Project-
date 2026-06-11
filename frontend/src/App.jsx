import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Tasks from './pages/Tasks';

function App() {
  return (
    <Router>
      <Routes>
        {/* Định tuyến bọc qua Khung MainLayout chính */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="tasks" element={<Tasks />} />
          {/* Các route trống để tránh lỗi khi bấm menu */}
          <Route path="timer" element={<div className="p-4 bg-white rounded-2xl border border-[#dce2f3]">Time Tracker Section</div>} />
          <Route path="calendar" element={<div className="p-4 bg-white rounded-2xl border border-[#dce2f3]">Calendar Section</div>} />
          <Route path="settings" element={<div className="p-4 bg-white rounded-2xl border border-[#dce2f3]">Settings Section</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;