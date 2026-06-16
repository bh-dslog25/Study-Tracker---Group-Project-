import React from 'react';

const TimeTracker = () => {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3525cd]">
          <span className="material-symbols-outlined text-[26px]">schedule</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Time Tracker</h1>
          <p className="text-sm text-slate-400">Quản lý và tối ưu hóa thời gian học tập sâu (Deep Work)</p>
        </div>
      </div>
      
      {/* Khung tiến độ giả lập */}
      <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
        <span className="material-symbols-outlined text-slate-300 text-[48px] mb-2 block">hourglass_empty</span>
        <p className="text-slate-500 font-semibold text-sm">Tính năng đếm giờ Pomodoro & Focus Session</p>
        <p className="text-slate-400 text-xs mt-1">Hệ thống đang kết nối dữ liệu module. Vui lòng quay lại sau!</p>
      </div>
    </div>
  );
};

export default TimeTracker;
    