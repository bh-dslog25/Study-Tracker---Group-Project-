import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { useSocket } from '../context/SocketContext';
import './Dashboard.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SAMPLE_DATA = {
  'This Week': [65, 80, 45, 90, 70, 30, 50],
  'Last Week': [40, 55, 70, 60, 85, 45, 35],
};

const Dashboard = () => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const [week, setWeek] = useState('This Week');
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState(null);

  const todayIdx = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }, []);

  const barData = SAMPLE_DATA[week] || SAMPLE_DATA['This Week'];

   
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (user?.role !== 'student') return;
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

    fetchAssignedTasks();
  }, [user]);

  const stats = [
    { label: 'Giờ học hôm nay', value: '4.5h', icon: 'schedule', color: 'bg-blue-50 text-blue-600' },
    { label: 'Task hoàn thành', value: '8/12', icon: 'task_alt', color: 'bg-green-50 text-green-600' },
    { label: 'Mục tiêu đang chạy', value: '3', icon: 'target', color: 'bg-purple-50 text-purple-600' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinMessage(null);
    try {
      const res = await axios.post('/classes/join', { inviteCode: inviteCode.trim() });
      if (res.data.success) {
        setJoinMessage({ type: 'success', text: 'Join request sent! Please wait for teacher approval.' });
        setInviteCode('');
        setTimeout(() => {
          setShowJoinModal(false);
          setJoinMessage(null);
        }, 2000);
      }
    } catch (err) {
      setJoinMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send join request' });
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Study Activity */}
      <div className="weekly-chart-card">
        <div className="weekly-chart-header">
          <h2 className="weekly-chart-title">Weekly Study Activity</h2>
          <select
            className="week-select"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
          >
            <option>This Week</option>
            <option>Last Week</option>
          </select>
        </div>
        <div className="weekly-bars">
          {DAYS.map((day, i) => {
            const isToday = i === todayIdx;
            return (
              <div key={day} className="bar-column">
                <div className={`bar-fill ${isToday ? 'bar-today' : 'bar-default'}`}
                     style={{ height: `${barData[i]}%` }}
                />
                <span className={`bar-day-label ${isToday ? 'label-today' : ''}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assigned Tasks / Notifications */}
      {user?.role === 'student' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Assigned Tasks</h2>
            {assignedTasks.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                {assignedTasks.length} new
              </span>
            )}
          </div>
          
          {loadingTasks ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-slate-500">Loading tasks...</p>
            </div>
          ) : assignedTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No assigned tasks yet</p>
              <p className="text-xs text-slate-400 mt-1">Tasks assigned by your teachers will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedTasks.map(task => (
                <div key={task.id} className="p-4 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-slate-800">{task.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {task.deadline && (
                          <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full ${task.isDone ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {task.isDone ? 'Done' : 'Pending'}
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

      {/* Join Class by Code - Student */}
      {user?.role === 'student' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-indigo-600">group_add</span>
              <h2 className="text-lg font-bold text-slate-800">Join Class</h2>
            </div>
            <button
              onClick={() => setShowJoinModal(!showJoinModal)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
            >
              {showJoinModal ? 'Cancel' : 'Enter Class Code'}
            </button>
          </div>
          {showJoinModal && (
            <form onSubmit={handleJoinClass} className="mt-4 p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100">
              <label className="text-xs font-semibold text-slate-500 block mb-2">Enter the class invite code shared by your teacher</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3D4"
                  maxLength={8}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
                <button type="submit" disabled={joinLoading} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                  {joinLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Sending...
                    </span>
                  ) : 'Join Class'}
                </button>
              </div>
              {joinMessage && (
                <p className={`mt-3 text-xs font-medium ${joinMessage.type === 'error' ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50'} px-4 py-2.5 rounded-lg`}>
                  {joinMessage.text}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;