import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAdminAuth } from '../context/AdminAuthContext';

const Classes = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();

  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [message, setMessage] = useState('');

  const [showTaskList, setShowTaskList] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [classStudentsMap, setClassStudentsMap] = useState({});
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [selectedClassForStudent, setSelectedClassForStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({ username: '', email: '', password: '' });

  const adminAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
  }), []);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3500);
  };

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/classes', adminAuthHeaders());
      setClassList(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      showMsg('Error loading classes', 'error');
    } finally {
      setLoading(false);
    }
  }, [adminAuthHeaders]);

  useEffect(() => {
    if (!admin) {
      navigate('/admin', { replace: true });
    }
  }, [admin, navigate]);

  useEffect(() => {
    if (!admin) return;
    fetchClasses();
  }, [fetchClasses, admin]);

  const fetchAssignedTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await axios.get('/tasks/student/assigned');
      if (res.data.success && Array.isArray(res.data.data)) {
        setAssignedTasks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching assigned tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await axios.get('/admin/students', adminAuthHeaders());
      const data = res.data.data;
      const studentsArray = (data && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : []);
      setAllStudents(studentsArray);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchAllStudents();
    }
  }, [admin]);

  const toggleClassExpand = async (cls) => {
    if (expandedClassId === cls.id) {
      setExpandedClassId(null);
      return;
    }
    setExpandedClassId(cls.id);
    if (!classStudentsMap[cls.id]) {
      try {
        const res = await axios.get(`/admin/classes/${cls.id}/overview`, adminAuthHeaders());
        const data = res.data.data;
        let studentsData = [];
        if (data && Array.isArray(data.students)) studentsData = data.students;
        else if (data && Array.isArray(data.data)) studentsData = data.data;
        setClassStudentsMap(prev => ({ ...prev, [cls.id]: studentsData }));
      } catch (err) {
        showMsg(err.response?.data?.message || 'Error loading students', 'error');
      }
    }
  };

  useEffect(() => {
    if (showTaskList && assignedTasks.length === 0 && !loadingTasks) {
      fetchAssignedTasks();
    }
  }, [showTaskList]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return showMsg('Please enter class name', 'error');
    try {
      await axios.post('/classes', { name: newClassName.trim() }, adminAuthHeaders());
      showMsg('Class created successfully!');
      setNewClassName('');
      setShowCreateClass(false);
      fetchClasses();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error creating class', 'error');
    }
  };

  const openAddStudentForm = (cls) => {
    setSelectedClassForStudent(cls);
    setShowAddStudentForm(true);
  };

  const handleAddStudentToClass = async () => {
    const { username, email, password } = newStudent;
    if (!email.trim() || !username.trim() || !password) return;
    try {
      await axios.post('/admin/students', { username: username.trim(), email: email.trim(), password });
      showMsg('Student added successfully!');
      setNewStudent({ username: '', email: '', password: '' });
      setShowAddStudentForm(false);
      setSelectedClassForStudent(null);
      fetchAllStudents();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error adding student', 'error');
    }
  };

  const goToClassDetail = (cls) => {
    navigate(`/admin/classes/${cls.id}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const totalTasks = assignedTasks.length;
  const stats = [
    { label: 'Tổng số lớp', value: `${classList.length}`, icon: 'school', color: 'bg-blue-50 text-blue-600' },
    { label: 'Học viên', value: `${classList.reduce((sum, cls) => sum + (cls.members?.length || 0), 0)}`, icon: 'group', color: 'bg-purple-50 text-purple-600' },
    { label: 'Task đã giao', value: `${totalTasks}`, icon: 'task_alt', color: 'bg-green-50 text-green-600', clickable: true },
    { label: 'Đang truy cập', value: 'Quản lý lớp học', icon: 'badge', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {message && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all duration-300 ${message.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {message.text}
        </div>
      )}

      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white rounded-xl transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">My Classes</h1>
              <p className="text-sm text-slate-500 mt-1">Manage classes, track progress, and assign tasks</p>
            </div>
          </div>
          <button
            onClick={() => { setShowCreateClass(!showCreateClass); setNewClassName(''); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Class
          </button>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const isClickable = stat.clickable;
            const isExpanded = isClickable && showTaskList;
            return (
              <div
                key={index}
                onClick={() => isClickable && setShowTaskList(!showTaskList)}
                className={`bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 ${isClickable ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
                  </div>
                  {isClickable && (
                    <span className="material-symbols-outlined text-indigo-500 text-lg transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Expandable Task List */}
        {showTaskList && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Danh sách nhiệm vụ đã giao</h3>
            {loadingTasks ? (
              <div className="text-center py-6">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Đang tải...</p>
              </div>
            ) : assignedTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">Chưa có nhiệm vụ nào được giao</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTasks.map(task => (
                  <div key={task.id} className="p-4 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm text-slate-800">{task.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-500 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {task.deadline && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">event</span>
                              {new Date(task.deadline).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full ${task.isDone ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {task.isDone ? 'Hoàn thành' : 'Đang thực hiện'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Class Form */}
        {showCreateClass && (
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm mb-8">
            <h3 className="font-bold text-slate-800 mb-3">Create New Class</h3>
            <div className="flex gap-3">
              <input
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="Enter class name"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                onKeyDown={e => e.key === 'Enter' && handleCreateClass()}
              />
              <button onClick={handleCreateClass} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold">Create</button>
              <button onClick={() => { setShowCreateClass(false); setNewClassName(''); }} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Add New Student</h3>
              {selectedClassForStudent && (
                <p className="text-sm text-slate-500 mb-4">Adding to: <span className="font-semibold text-indigo-600">{selectedClassForStudent.name}</span></p>
              )}
              <div className="flex flex-col gap-3">
                <input
                  value={newStudent.username}
                  onChange={e => setNewStudent({ ...newStudent, username: e.target.value })}
                  placeholder="Username"
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
                <input
                  value={newStudent.email}
                  onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="student@email.com"
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
                <input
                  value={newStudent.password}
                  onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                  type="password"
                  placeholder="Password (min 6 characters)"
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleAddStudentToClass} className="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold">Add Student</button>
                  <button onClick={() => { setShowAddStudentForm(false); setSelectedClassForStudent(null); setNewStudent({ username: '', email: '', password: '' }); }} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-200">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500">Loading classes...</p>
          </div>
        ) : classList.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">No classes yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Class" to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {classList.map(cls => {
              const isExpanded = expandedClassId === cls.id;
              const studentsInClass = classStudentsMap[cls.id] || [];
              return (
                <div key={cls.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="p-6" onClick={() => toggleClassExpand(cls)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{cls.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{cls.members?.length || 0} students</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-indigo-500 text-lg transition-transform duration-200`} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          expand_more
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); openAddStudentForm(cls); }}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-colors">
                          + Add Student
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); goToClassDetail(cls); }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div className="pt-4">
                        {studentsInClass.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">No students in this class</p>
                        ) : (
                          <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                            {studentsInClass.map(s => (
                              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                    {s.username?.[0]?.toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-slate-800">{s.username}</p>
                                    <p className="text-xs text-slate-400">{s.email}</p>
                                  </div>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-50 text-green-600 border border-green-200">Active</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;