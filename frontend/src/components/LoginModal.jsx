import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const { login, register } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setFormData({ username: '', email: '', password: '' });
      setIsLogin(true);
      setShowPassword(false);
    }
  }, [isOpen]);

  // Nếu Navbar chưa truyền isOpen = true thì chặn không render
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'student'
      });
    }

    if (result?.success) {
      onClose();
    } else {
      alert(result?.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    // CHỈNH SỬA: Ép z-[9999] cao nhất hệ thống và thêm lớp nền mờ click để đóng nhanh
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      {/* Lớp nền đen mờ độc lập phía sau */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Hộp thoại trắng nổi lên lớp z-10 phía trên nền đen */}
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 relative z-10">
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-medium text-lg focus:outline-none"
        >
          ✕
        </button>
        <h3 className="font-bold text-xl text-gray-800 mb-5 text-center">
          {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Tên đăng nhập</label>
              <input 
                type="text"
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500" 
                placeholder="Nhập tên đăng nhập" 
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Địa chỉ Email</label>
            <input 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500" 
              placeholder="Email" 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Mật khẩu</label>
            <div className="relative w-full">
              <input 
                className="w-full border border-gray-200 p-2.5 rounded-xl pr-12 text-sm focus:outline-none focus:border-indigo-500" 
                type={showPassword ? "text" : "password"} 
                placeholder="Mật khẩu" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-xs font-semibold text-gray-400 hover:text-indigo-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "ẨN" : "HIỆN"}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 mt-2 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-lg">
            {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div className="mt-5 text-xs text-center text-gray-500 border-t border-gray-100 pt-4">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"} 
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ username: '', email: '', password: '' });
            }} 
            className="text-indigo-600 font-bold ml-1 hover:underline focus:outline-none"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}