import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import TimeTracker from './pages/TimeTracker';
import FocusSession from './pages/FocusSession';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Admin from './pages/Admin';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          {/* Admin page (riêng biệt, không dùng MainLayout) */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/classes" element={<Classes />} />
          <Route path="/admin/classes/:classId" element={<ClassDetail />} />

          {/* Các trang chính dùng MainLayout */}
          <Route path="/*" element={
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
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<div className="bg-white p-6 rounded-2xl border border-gray-100 font-bold text-slate-700">Settings page (Under development)</div>} />
                
                {/* Đưa Route 404 vào trong này */}
                <Route path="*" element={<div className="p-10 text-center">404 - Page not found</div>} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;