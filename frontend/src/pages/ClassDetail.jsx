import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useSocket } from '../context/SocketContext';

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { isUserOnline } = useSocket();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Task assignment state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const adminAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
  });

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3500);
  };

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/classes/${classId}/overview`, adminAuthHeaders());
      const data = res.data.data;

      setClassInfo(data?.classInfo || null);

      let studentsData = [];
      if (data && Array.isArray(data.students)) studentsData = data.students;
      else if (data && Array.isArray(data.data)) studentsData = data.data;

      const studentsWithOnline = studentsData.map(s => ({
        ...s,
        isOnline: isUserOnline(s.id),
      }));
      setStudents(studentsWithOnline);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error loading class students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin) {
      navigate('/admin', { replace: true });
    }
  }, [admin, navigate]);

  useEffect(() => {
    if (!classId || !admin) return;
    fetchClassDetail();
  }, [classId, admin]);

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || selectedStudents.length === 0) {
      return showMsg('Please enter task title and select at least one student', 'error');
    }

    try {
      const payload = {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        deadline: taskDeadline || undefined,
        priority: taskPriority,
        assignedStudentIds: selectedStudents,
      };

      await axios.post(`/tasks/classes/${classId}`, payload, adminAuthHeaders());
      showMsg('Task assigned successfully!');
      setTaskTitle('');
      setTaskDesc('');
      setTaskDeadline('');
      setTaskPriority('medium');
      setSelectedStudents([]);
      setShowCreateTask(false);
      fetchClassDetail();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error creating task', 'error');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const removeStudentFromClass = async (studentId) => {
    if (!confirm('Are you sure you want to remove this student from this class?')) return;
    try {
      await axios.delete(`/admin/classes/${classId}/students/${studentId}`, adminAuthHeaders());
      showMsg('Student removed successfully');
      fetchClassDetail();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error removing student', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading && !classInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading class details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {message && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all duration-300 ${message.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {message.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white rounded-xl transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">{classInfo?.name || 'Class Detail'}</h1>
              <p className="text-sm text-slate-500 mt-1">Manage students, track progress, and assign tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {classInfo && (
              <>
                <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                  {classInfo.inviteCode}
                </span>
                <button onClick={() => setShowCreateTask(!showCreateTask)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Assign Task
                </button>
              </>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-indigo-600">{students.length}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Total Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">{students.filter(s => s.isOnline).length}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Online Now</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sky-600">{students.filter(s => s.isActive !== false).length}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Active</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">{classInfo?.isActive ? 'Active' : 'Inactive'}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Class Status</p>
            </div>
          </div>
        </div>

        {/* Create Task Form */}
        {showCreateTask && (
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm mb-8">
            <h3 className="font-bold text-slate-800 mb-4">Create New Task Assignment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Task Title *</label>
                <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Enter task title"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Task description (optional)" rows="3"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deadline</label>
                  <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority</label>
                  <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Assign to Students ({selectedStudents.length === students.length ? 'All' : `${selectedStudents.length} selected`})
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-gray-100 mb-1 pb-2">
                    <input type="checkbox" checked={selectedStudents.length === students.length && students.length > 0}
                      onChange={() => { setSelectedStudents(selectedStudents.length === students.length ? [] : students.map(s => s.id)); }}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                    <span className="text-sm font-semibold text-slate-800">Select All</span>
                  </label>
                  {students.map(s => (
                    <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleStudentSelection(s.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-700">{s.username}</span>
                      <span className="text-xs text-slate-400">({s.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateTask} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold">Create & Assign</button>
                <button onClick={() => { setShowCreateTask(false); setSelectedStudents([]); }} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Students Table */}
        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
            <p className="text-slate-500 font-medium">No students in this class</p>
            <p className="text-xs text-slate-400 mt-1">Go back to admin to add students</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[500px] scrollbar-hide rounded-2xl border border-slate-200">
            <table className="w-full bg-white">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => {
                  const stats = s.stats || {};
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                              {s.username?.[0]?.toUpperCase()}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${s.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{s.username}</p>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.isActive !== false ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                          {s.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(s.joinedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.progressPercent || 0}%` }} />
                          </div>
                          <span className="text-xs font-bold text-indigo-600">{stats.progressPercent || 0}%</span>
                        </div>
                        <div className="flex gap-2 mt-1 text-[10px] text-slate-400">
                          <span>Done: {stats.completed || 0}</span>
                          <span>In: {stats.inProgress || 0}</span>
                          <span>Late: {stats.late || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => removeStudentFromClass(s.id)}
                          className="text-red-600 hover:text-red-700 font-medium transition-colors">Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;