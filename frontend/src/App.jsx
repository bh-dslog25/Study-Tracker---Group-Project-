import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import TimeTracker from './pages/TimeTracker';
import FocusSession from './pages/FocusSession';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Chuyển hướng */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Các trang chính */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/focus" element={<FocusSession />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/time-tracker" element={<TimeTracker />} /> 
          
          {/* Các trang giữ chỗ */}
          <Route path="/tasks" element={<div className="bg-white p-6 rounded-2xl border border-gray-100 font-bold text-slate-700">Trang Tasks (Đang thiết kế)</div>} />
          <Route path="/calendar" element={<div className="bg-white p-6 rounded-2xl border border-gray-100 font-bold text-slate-700">Trang Calendar (Đang thiết kế)</div>} />
          <Route path="/settings" element={<div className="bg-white p-6 rounded-2xl border border-gray-100 font-bold text-slate-700">Trang Settings (Đang thiết kế)</div>} />
          
          {/* Đưa Route 404 vào trong này */}
          <Route path="*" element={<div className="p-10 text-center">404 - Không tìm thấy trang</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;