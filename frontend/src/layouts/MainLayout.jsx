import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-slate-50/50 overflow-hidden font-sans antialiased">
      {/* Sidebar cố định bên trái, không bị cuộn */}
      <Sidebar />

      {/* Khoang chứa bên phải bao gồm cả Navbar và Vùng nội dung */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Navbar cố định ở đầu */}
        <Navbar />

        {/* Vùng nội dung chính: Bật overflow-y-auto để kích hoạt thanh cuộn dọc chuẩn chỉnh */}
        <main className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full space-y-6 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;