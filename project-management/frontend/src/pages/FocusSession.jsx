import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FocusSession = () => {
  const [showAlert, setShowAlert] = useState(true);

  // Tự động ẩn thông báo sau 3 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      
      {/* THANH THÔNG BÁO ALERT */}
      {showAlert && (
        <div className="mb-8 flex items-center gap-3 bg-green-100 text-green-700 px-6 py-3 rounded-xl border border-green-200 animate-fade-in shadow-sm">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-bold">Bắt đầu thành công!</span>
        </div>
      )}

      <h1 className="text-3xl font-bold text-[#151c27]">Focus Mode</h1>
      <p className="text-[#464555] mt-2">Đang trong phiên làm việc tập trung...</p>
      
      <Link 
        to="/" 
        className="mt-8 text-[#3525cd] font-semibold border border-[#3525cd] px-6 py-2 rounded-lg hover:bg-indigo-50 transition-all"
      >
        Quay lại Dashboard
      </Link>
    </div>
  );
};

export default FocusSession;