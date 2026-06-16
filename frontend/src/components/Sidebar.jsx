
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/tasks', label: 'Tasks', icon: 'task_alt' },
    { path: '/time-tracker', label: 'Time Tracker', icon: 'schedule' },
    { path: '/goals', label: 'Goals', icon: 'target' },
    { path: '/calendar', label: 'Calendar', icon: 'calendar_today' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between p-6 select-none">
      <div className="space-y-8">
        
        {/* Khối Logo ứng dụng */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-[#3525cd] flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <span className="material-symbols-outlined text-[22px]">token</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">StudyTracker</h1>
            <span className="text-[10px] text-[#3525cd] font-bold uppercase tracking-wider block mt-0.5">Deep Work Mode</span>
          </div>
        </div>

        {/* Danh sách các Tab chức năng */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#3525cd] text-white shadow-lg shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Khối chức năng cố định ở đáy Sidebar */}
      <div className="space-y-4 pt-4 border-t border-gray-50">
        {/* Nút Settings */}
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive 
                ? 'bg-[#3525cd] text-white' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </NavLink>
        
      </div>

    </div>
  );
};

export default Sidebar;