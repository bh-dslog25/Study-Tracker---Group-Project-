import React from 'react';
import { Link } from 'react-router-dom';  
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  // Logic ngày tháng
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; 
  const chartData = [24, 16, 28, 36, 12, 20, 8];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
     <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#151c27]">Dashboard</h2>
          <p className="text-sm text-[#464555]">Chào mừng bạn trở lại!</p>
        </div>
        <Link
          to="/focus"
          className="flex items-center gap-2 bg-[#3525cd] hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-indigo-300"
        >
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          Start Focus Session
        </Link>

      </div>
      {/* sTATS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="bg-white border border-[#dce2f3] p-6 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h3 className="text-4xl font-bold text-[#151c27]">18</h3>
          <p className="text-xs text-[#464555] font-semibold mt-1">Tasks Completed</p>
        </div>

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
            <div className="text-xs border border-[#dce2f3] px-3 py-1.5 rounded-xl bg-slate-50 font-medium text-[#464555]">
              {new Date().toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
            </div>
          </div>
          
          <div className="flex justify-between items-end h-36 px-4 mt-4 border-b border-slate-100 pb-2">
            {chartData.map((height, index) => (
              <div 
                key={index}
                className={`w-8 rounded-t-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-indigo-600 
                  ${index === todayIndex 
                    ? 'bg-indigo-600 shadow-lg shadow-indigo-200' 
                    : 'bg-slate-100'
                  }`}
                style={{ height: `${(height / 40) * 100}%` }}
              ></div>
            ))}
          </div>
          
          <div className="flex justify-between text-center text-xs font-semibold px-4 mt-2">
            {days.map((day, index) => (
              <span key={day} className={`w-8 ${index === todayIndex ? 'text-indigo-600 font-bold' : 'text-[#464555]'}`}>
                {day}
              </span>
            ))}
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
            <p className="text-xs text-[#464555] leading-relaxed">Hãy nhấn vào tab "Goals" ở menu để thiết lập mục tiêu mới ngay nhé!</p>
          </div>
        </div>
      </section>

      {/* 📋 UPCOMING TASKS */}
      <section className="bg-white border border-[#dce2f3] p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-[#151c27] text-sm">Upcoming Tasks</h4>
          <a href="/tasks" className="text-xs font-bold text-[#3525cd] hover:underline flex items-center">
            View All <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </a>
        </div>
        <div 
          className="flex flex-col gap-3 pr-2 overflow-y-auto" 
          style={{ maxHeight: '300px', scrollbarWidth: 'thin' }}
        >
          {[1, 2, 3, 4, 5, 6].map((item) => <TaskCard key={item} />)}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;