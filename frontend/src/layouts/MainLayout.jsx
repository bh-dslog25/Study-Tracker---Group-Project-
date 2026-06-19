import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Khu vực nội dung chính bên phải */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar trên cùng */}
        <Navbar />

        {/* Nội dung trang */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;