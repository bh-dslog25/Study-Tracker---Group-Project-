import React from 'react';

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      
      {/* 📊 STATS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Hours */}
        <div className="bg-white border border-[#dce2f3] p-6 rounded-2xl shadow-sm relative">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
          </div>
          <span className="absolute top-6 right-6 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px] font-bold">arrow_upward</span>12%
          </span>
          <h3 className="text-4xl font-bold text-[#151c27]">42h</h3>
          <p className="text-xs text-[#464555] font-semibold mt-1">Total Study Hours</p>
        </div>

        {/* Card 2: Tasks */}
        <div className="bg-white border border-[#dce2f3] p-6 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h3 className="text-4xl font-bold text-[#151c27]">18</h3>
          <p className="text-xs text-[#464555] font-semibold mt-1">Tasks Completed</p>
        </div>

        {/* Card 3: Progress */}
        <div className="bg-white border border-[#dce2f3] p-6 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
          </div>
          <h3 className="text-4xl font-bold text-[#151c27]">75%</h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#3525cd] h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </section>

      {/* 📊 GRAPH & GOAL */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[320px]">
        {/* Weekly Study Activity */}
        <div className="lg:col-span-2 bg-white border border-[#dce2f3] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-[#151c27] text-sm">Weekly Study Activity</h4>
            <button className="text-xs border border-[#dce2f3] px-3 py-1.5 rounded-xl bg-slate-50 font-medium flex items-center gap-1 text-[#464555]">
              This Week <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
          </div>
          
          {/* Các cột biểu đồ */}
          <div className="flex justify-between items-end h-36 px-4 mt-4 border-b border-slate-100 pb-2">
            <div className="w-8 bg-slate-100 h-24 rounded-t-md"></div>
            <div className="w-8 bg-slate-100 h-16 rounded-t-md"></div>
            <div className="w-8 bg-slate-100 h-28 rounded-t-md"></div>
            {/* Cột Thứ 5 (Thu) màu tím nổi bật */}
            <div className="w-8 bg-[#3525cd] h-36 rounded-t-md"></div>
            <div className="w-8 bg-slate-100 h-12 rounded-t-md"></div>
            <div className="w-8 bg-slate-100 h-20 rounded-t-md"></div>
            <div className="w-8 bg-slate-100 h-8 rounded-t-md"></div>
          </div>
          
          {/* Nhãn Thứ */}
          <div className="flex justify-between text-center text-xs text-[#464555] font-semibold px-4 mt-2">
            <span className="w-8">Mon</span><span className="w-8">Tue</span><span className="w-8">Wed</span><span className="w-8 text-[#3525cd] font-bold">Thu</span><span className="w-8">Fri</span><span className="w-8">Sat</span><span className="w-8">Sun</span>
          </div>
        </div>

        {/* Current Goal */}
        <div className="bg-white border border-[#dce2f3] p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative min-h-[280px]">
          <div className="w-full flex justify-between items-center absolute top-6 px-6">
            <h4 className="font-bold text-[#151c27] text-sm">Current Goal</h4>
            <span className="material-symbols-outlined text-[#464555] cursor-pointer">more_horiz</span>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center mt-6">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-dashed border-slate-300">
              <span className="material-symbols-outlined text-[26px] text-slate-400">target</span>
            </div>
            <h5 className="font-bold text-[#151c27] text-sm mb-1">Bạn chưa có mục tiêu nào</h5>
            <p className="text-xs text-[#464555] leading-relaxed">
              Hãy nhấn vào tab "Goals" ở menu <br /> để thiết lập mục tiêu mới ngay nhé!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;