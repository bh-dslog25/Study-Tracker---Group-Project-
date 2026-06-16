import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Admin = () => {
  const { user, logout } = useAuth();
  const isLoggedIn = user && (user.id || user.username);

  const [classList, setClassList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [addStudentEmail, setAddStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isUserOnline } = useSocket();

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3500);
  };

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });

  useEffect(() => {
    if (isLoggedIn && user.role === 'teacher') fetchClasses();
  }, [isLoggedIn]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/admin/classes', authHeaders());
      setClassList(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get('/admin/students', authHeaders());
      setAllStudents(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) { console.error(err); }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return showMsg('Vui lòng nhập tên lớp', 'error');
    try {
      await axios.post('/classes', { name: newClassName.trim() }, authHeaders());
      showMsg('Tạo lớp thành công!');
      setNewClassName('');
      setShowCreateClass(false);
      fetchClasses();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi tạo lớp', 'error');
    }
  };

  const viewClassStudents = async (classId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/classes/${classId}/overview`, authHeaders());
      const data = res.data.data || res.data;
      setSelectedClass({ id: classId, ...data.classInfo });
      setClassStudents(data.students || []);
      setShowAddStudent(false);
      setAddStudentEmail('');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi tải danh sách', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudentByEmail = async () => {
    if (!addStudentEmail.trim()) return showMsg('Vui lòng nhập email', 'error');
    try {
      const res = await axios.post(`/admin/classes/${selectedClass.id}/add-student`,
        { email: addStudentEmail.trim() }, authHeaders()
      );
      showMsg(res.data?.message || 'Thêm thành công!');
      setAddStudentEmail('');
      viewClassStudents(selectedClass.id);
      fetchClasses();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi thêm học sinh', 'error');
    }
  };

  const handleAddStudentById = async (studentId, email) => {
    try {
      await axios.post(`/admin/classes/${selectedClass.id}/add-student`,
        { email }, authHeaders()
      );
      showMsg('Thêm học sinh vào lớp thành công!');
      viewClassStudents(selectedClass.id);
      fetchClasses();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi thêm học sinh', 'error');
    }
  };

  const isInClass = (studentId) => classStudents.some(s => s.id === studentId);

  // Kiểm tra đăng nhập
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mb-6">Vui lòng đăng nhập với tài khoản giáo viên</p>
          <a href="/dashboard" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">← Quay lại đăng nhập</a>
        </div>
      </div>
    );
  }

  if (user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Truy cập bị từ chối</h1>
          <p className="text-sm text-slate-500 mb-6">Chỉ giáo viên mới có quyền truy cập</p>
          <a href="/dashboard" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm">← Quay lại</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Xin chào, <span className="font-semibold">{user.username}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-200">← Trang chính</a>
            <button onClick={logout} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold shadow-md">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div className={`mb-6 p-4 border rounded-xl text-sm ${
            message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>{message.text}</div>
        )}

        {!selectedClass ? (
          // ===== DANH SÁCH LỚP =====
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">📚 Danh sách lớp học</h2>
              <button onClick={() => setShowCreateClass(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Tạo lớp mới
              </button>
            </div>

            {showCreateClass && (
              <div className="mb-6 p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-3">Tạo lớp học mới</h3>
                <div className="flex gap-3">
                  <input type="text" value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Nhập tên lớp..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateClass()}
                  />
                  <button onClick={handleCreateClass}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
                  >Tạo</button>
                  <button onClick={() => { setShowCreateClass(false); setNewClassName(''); }}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm"
                  >Huỷ</button>
                </div>
              </div>
            )}

            {classList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                <p className="text-4xl mb-3">🏫</p>
                <p className="text-slate-500 font-medium">Chưa có lớp học nào</p>
                <p className="text-xs text-slate-400 mt-1">Nhấn "Tạo lớp mới" để bắt đầu</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classList.map((cls) => (
                  <div key={cls.id} onClick={() => viewClassStudents(cls.id)}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cls.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>{cls.isActive ? 'Đang mở' : 'Đã đóng'}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{cls.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>👥 {cls.members?.length || 0}/{cls.maxStudents || 50}</span>
                      <span>🔑 {cls.inviteCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // ===== CHI TIẾT LỚP =====
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <button onClick={() => { setSelectedClass(null); setClassStudents([]); setShowAddStudent(false); }}
                  className="text-xs text-slate-400 hover:text-indigo-600 mb-2 block"
                >← Quay lại danh sách lớp</button>
                <h2 className="text-xl font-bold text-slate-800">📚 {selectedClass.name}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mã lớp: <span className="font-mono font-bold text-indigo-500">{selectedClass.inviteCode}</span>
                  {' · '}Sĩ số: {classStudents.length}/{selectedClass.maxStudents || 50}
                </p>
              </div>
              <button onClick={() => { setShowAddStudent(!showAddStudent); if (!showAddStudent) fetchAllStudents(); }}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Thêm học sinh
              </button>
            </div>

            {/* Form thêm học sinh */}
            {showAddStudent && (
              <div className="mb-6 p-5 bg-white rounded-2xl border border-emerald-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">📋 Danh sách học sinh</h3>
                
                {/* Search by email */}
                <div className="flex gap-3 mb-4">
                  <input type="email" value={addStudentEmail}
                    onChange={(e) => setAddStudentEmail(e.target.value)}
                    placeholder="Hoặc nhập email để thêm nhanh..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStudentByEmail()}
                  />
                  <button onClick={handleAddStudentByEmail}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold"
                  >Thêm bằng email</button>
                  <button onClick={() => { setShowAddStudent(false); setAddStudentEmail(''); }}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm"
                  >Đóng</button>
                </div>

                {/* Danh sách tất cả học sinh */}
                <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl">
                  {allStudents.length === 0 ? (
                    <p className="text-center py-8 text-slate-400">Không có học sinh nào trong hệ thống</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-50">
                        <tr>
                          <th className="text-left py-2.5 px-3 text-slate-500 font-semibold text-xs">ID</th>
                          <th className="text-left py-2.5 px-3 text-slate-500 font-semibold text-xs">Tên</th>
                          <th className="text-left py-2.5 px-3 text-slate-500 font-semibold text-xs">Email</th>
                              <th className="text-center py-2.5 px-3 text-slate-500 font-semibold text-xs">Trạng thái Online</th>
                          <th className="text-center py-2.5 px-3 text-slate-500 font-semibold text-xs">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allStudents.map((s) => {
                          const added = isInClass(s.id);
                          return (
                            <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-2.5 px-3 text-slate-500 text-xs">{s.id}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800 text-xs">{s.username}</td>
                              <td className="py-2.5 px-3 text-slate-400 text-xs">{s.email}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  isUserOnline(s.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>{isUserOnline(s.id) ? 'Đang hoạt động' : 'Chưa hoạt động'}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {added ? (
                                  <span className="text-xs text-emerald-600 font-semibold">✅ Đã tham gia</span>
                                ) : (
                                  <button onClick={() => handleAddStudentById(s.id, s.email)}
                                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold"
                                  >+ Thêm</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Danh sách học sinh trong lớp */}
            {classStudents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-slate-500 font-medium">Lớp này chưa có học sinh</p>
                <p className="text-xs text-slate-400 mt-1">Nhấn "Thêm học sinh" để thêm</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-slate-500 font-semibold">#</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-semibold">Tên</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-semibold">Email</th>
                        <th className="text-center py-3 px-3 text-slate-500 font-semibold text-xs">Trạng thái Online</th>
                        <th className="text-center py-3 px-3 text-slate-500 font-semibold text-xs" colSpan="4">📋 Tiến độ Task</th>
                        <th className="text-center py-3 px-3 text-slate-500 font-semibold text-xs" colSpan="2">🎯 Mục tiêu</th>
                      </tr>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th colSpan="4"></th>
                        <th className="text-center py-1.5 px-2 text-slate-400 font-semibold text-[10px]">Đã giao</th>
                        <th className="text-center py-1.5 px-2 text-slate-400 font-semibold text-[10px]">Đang làm</th>
                        <th className="text-center py-1.5 px-2 text-slate-400 font-semibold text-[10px]">Xong</th>
                        <th className="text-center py-1.5 px-2 text-slate-400 font-semibold text-[10px]">📊</th>
                        <th className="text-center py-1.5 px-2 text-slate-400 font-semibold text-[10px]">Giờ</th>
                        <th className="text-center py-1.5 px-2 text-slate-400 font-semibold text-[10px]">🎯</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((s, idx) => (
                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-slate-400 text-xs">{idx + 1}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">{s.username}</td>
                          <td className="py-3 px-4 text-slate-500 text-xs">{s.email}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isUserOnline(s.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>{isUserOnline(s.id) ? 'Đang hoạt động' : 'Chưa hoạt động'}</span>
                          </td>
                          <td className="py-3 px-2 text-center text-slate-500 font-medium text-xs">{s.stats?.assigned || 0}</td>
                          <td className="py-3 px-2 text-center text-amber-600 font-medium text-xs">{s.stats?.inProgress || 0}</td>
                          <td className="py-3 px-2 text-center text-emerald-600 font-medium text-xs">{s.stats?.completed || 0}</td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.stats?.progressPercent || 0}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">{s.stats?.progressPercent || 0}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-xs font-medium text-slate-600">
                              {s.goals?.achievedHours || 0}/{s.goals?.targetHours || 0}h
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full rounded-full ${(s.goals?.goalPercent || 0) >= 100 ? 'bg-purple-500' : 'bg-purple-400'}`} 
                                  style={{ width: `${Math.min(s.goals?.goalPercent || 0, 100)}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-purple-600">{s.goals?.goalPercent || 0}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Study Tracker — Admin Panel © 2026
      </footer>
    </div>
  );
};

export default Admin;