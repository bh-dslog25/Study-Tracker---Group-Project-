
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Navbar = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, logout } = useAuth();

  // Kiểm tra chắc chắn user có tồn tại dữ liệu thực sự (tránh object rỗng {})
  const isAuthenticated = user && (user.id || user.username);

  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 border-b border-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, Scholar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here is your academic overview for today.</p>
      </div>

      <div className="flex items-center gap-4">
        {/* // User Profile  */}
       
        <div className="flex items-center">
          {isAuthenticated ? (
            // Giao diện đã đăng nhập (Dạng Pill bo tròn)
            <div className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all duration-200 shadow-sm">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=random`}
                alt={user.username || 'User'}
                className="w-8 h-8 rounded-full object-cover shadow-sm border-2 border-white"
              />

              <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-gray-800 leading-none mb-1">
                  {user.username}
                </span>
                <span className="text-[11px] text-gray-500 font-medium leading-none uppercase tracking-wide">
                  Student
                </span>
              </div>

              <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>

              <button
                onClick={logout}
                title="Đăng xuất"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors focus:outline-none flex items-center justify-center gap-1.5 font-semibold text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          ) : (
            // Giao diện chưa đăng nhập
            <button
              onClick={() => {
                console.log("=== ĐÃ BẤM ĐĂNG NHẬP ===");
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-200 focus:outline-none"
            >
              
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Đăng nhập
            </button>
          )}
        </div>

       
        <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </header>
  );
};

export default Navbar;