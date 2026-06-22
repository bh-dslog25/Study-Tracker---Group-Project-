import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { useSocket } from '../context/SocketContext';
import Chatbot from '../components/Chatbot';
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
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState(null);

  const todayIdx = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }, []);

  const barData = SAMPLE_DATA[week] || SAMPLE_DATA['This Week'];

  const stats = [
    { label: 'Giờ học hôm nay', value: '4.5h', icon: 'schedule', color: 'bg-blue-50 text-blue-600' },
    { label: 'Task hoàn thành', value: '8/12', icon: 'task_alt', color: 'bg-green-50 text-green-600' },
    { label: 'Mục tiêu đang chạy', value: '3', icon: 'target', color: 'bg-purple-50 text-purple-600' },
  ];

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
      <Chatbot />
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
                  autoFocus
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