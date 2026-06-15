import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import tất cả các trang của bạn
// (Đảm bảo đường dẫn này khớp với vị trí thư mục của bạn, ví dụ: './pages/Login')
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import FocusSession from './pages/FocusSession';
import Goals from './pages/Goals';
import Tasks from './pages/Tasks';
import TimeTracker from './pages/TimeTracker';

// 2. Tạo một Component bảo vệ (Chống truy cập chui)
// Nó sẽ kiểm tra thẻ 'isLoggedIn' mà chúng ta đã lưu lúc Login thành công
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  if (!isLoggedIn) {
    // Nếu chưa đăng nhập, đá văng về trang login
    return <Navigate to="/login" replace />;
  }
  
  // Nếu đã đăng nhập, cho phép đi tiếp vào Component bên trong
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* =========================================
            PUBLIC ROUTES (Ai cũng vào được)
        ========================================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =========================================
            PROTECTED ROUTES (Phải đăng nhập mới vào được)
        ========================================= */}
        
        {/* Trang chủ mặc định là Dashboard */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/focus" 
          element={
            <ProtectedRoute>
              <FocusSession />
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
              <TimeTracker />
            </ProtectedRoute>
          } 
        />

        {/* =========================================
            CATCH-ALL ROUTE (Bắt lỗi gõ sai link)
        ========================================= */}
        {/* Bất kỳ đường dẫn nào không tồn tại sẽ tự động đưa về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}