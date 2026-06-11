import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="bg-[#f0f3ff] text-[#151c27] antialiased flex h-screen w-screen p-4 overflow-hidden justify-center items-center font-sans">
      {/* Khung container lớn bo tròn y hệt ảnh mockup */}
      <div className="w-full max-w-[1280px] h-[92vh] bg-white rounded-3xl shadow-2xl border border-[#dce2f3] flex overflow-hidden">
        
        {/* Sidebar cố định bên trái */}
        <Sidebar />

        {/* Vùng nội dung cuộn bên phải */}
        <main className="flex-1 h-full flex flex-col p-8 overflow-y-auto bg-slate-50/50">
          <Navbar />
          <div className="flex-1 mt-2">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default MainLayout;