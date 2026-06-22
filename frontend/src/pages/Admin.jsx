import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAdminAuth, useAdminVerified } from '../context/AdminAuthContext';
import { useSocket } from '../context/SocketContext';
import AdminPasswordModal from '../components/AdminPasswordModal';

const Admin = () => {
  const navigate = useNavigate();
  const { admin, adminLogin, adminRegister, adminLogout } = useAdminAuth();
  const { adminVerified, setAdminVerified, verifyAdminPassword } = useAdminVerified();
  const isLoggedIn = admin && (admin.id || admin.username);

  const [showAdminLogin, setShowAdminLogin] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminFormLoading, setAdminFormLoading] = useState(false);
  const [adminFormError, setAdminFormError] = useState('');

  const [classList, setClassList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [classOverview, setClassOverview] = useState(null);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showGlobalAddStudent, setShowGlobalAddStudent] = useState(false);
  const [globalNewStudent, setGlobalNewStudent] = useState({ username: '', email: '', password: '' });
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [addStudentEmail, setAddStudentEmail] = useState('');
  const [message, setMessage] = useState('');
  const { isUserOnline, socket } = useSocket();
  const isUserOnlineRef = React.useRef(isUserOnline);
  isUserOnlineRef.current = isUserOnline;
  const stableIsUserOnline = React.useCallback((id) => isUserOnlineRef.current(id), []);
  const [filterOnline, setFilterOnline] = useState('all');
  const [joinRequests, setJoinRequests] = useState([]);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const lastFetchRef = React.useRef(0);
  const joinRequestsFetchedRef = React.useRef(false);
  const pollingRef = React.useRef(null);
  const isPollingActive = React.useRef(false);

  const adminAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_access_token')}` }
  }), []);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3500);
  };

  const fetchClasses = useCallback(async () => {
    try {
      const res = await axios.get('/admin/classes', adminAuthHeaders());
      setClassList(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) { console.error(err); }
  }, [adminAuthHeaders]);

  const fetchAllStudents = useCallback(async () => {
    try {
      const res = await axios.get('/admin/students', adminAuthHeaders());
      const data = res.data.data;
      const studentsArray = (data && Array.isArray(data.data)) ? data.data : (Array.isArray(data) ? data : []);
      const studentsWithOnline = studentsArray.map(s => ({ ...s, isOnline: stableIsUserOnline(s.id) }));
      setAllStudents(studentsWithOnline);
    } catch (err) { console.error(err); }
  }, [adminAuthHeaders, stableIsUserOnline]);

  const fetchJoinRequests = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return; // debounce 1s
    lastFetchRef.current = now;

    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      console.warn('No admin token found');
      return;
    }

    try {
      setLoadingRequests(true);
      const res = await axios.get('/admin/join-requests', adminAuthHeaders());
      const data = res.data.data;
      setJoinRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        console.warn('Unauthorized when fetching join requests');
      } else {
        console.error('Error fetching join requests:', err.response?.data || err.message);
      }
    } finally {
      setLoadingRequests(false);
    }
  }, [adminAuthHeaders]);

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.put(`/admin/join-requests/${requestId}/approve`, {}, adminAuthHeaders());
      showMsg('Join request approved! Student added to class.');
      setJoinRequests(prev => prev.filter(r => r.id !== requestId));
      fetchClasses();
      fetchAllStudents();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error approving request', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`/admin/join-requests/${requestId}/reject`, {}, adminAuthHeaders());
      showMsg('Join request rejected.');
      setJoinRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error rejecting request', 'error');
    }
  };

  // Auto-refresh join requests every 3s (prevent duplicate polling)
  useEffect(() => {
    if (!isLoggedIn || admin?.role !== 'teacher' || !adminVerified) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        isPollingActive.current = false;
      }
      return;
    }

    if (isPollingActive.current) return; // already polling

    isPollingActive.current = true;
    pollingRef.current = setInterval(() => {
      fetchJoinRequests();
    }, 3000);

    console.log('[Admin] Polling join requests every 3s');
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      isPollingActive.current = false;
    };
  }, [isLoggedIn, admin?.role, adminVerified, fetchJoinRequests]);

  // Socket listener for real-time join request (chỉ nhận request của class mình)
  useEffect(() => {
    if (!socket || !admin?.id) return;
    const handler = (request) => {
      // Chỉ hiển thị nếu request thuộc về teacher này
      if (request.teacherId && Number(request.teacherId) !== Number(admin.id)) {
        console.log('[Admin] Ignoring join request for another teacher:', request.teacherId);
        return;
      }
      console.log('[Admin] New join request via socket:', request);
      showMsg(
        `📋 ${request.studentName || 'A student'} wants to join ${request.className || 'class'}`,
        'info'
      );
      fetchJoinRequests();
    };
    socket.on('new-join-request', handler);
    return () => socket.off('new-join-request', handler);
  }, [socket, admin?.id, fetchJoinRequests]);

  const toggleJoinRequests = () => {
    if (!showJoinRequests) {
      fetchJoinRequests();
    }
    setShowJoinRequests(prev => !prev);
  };

  // When admin is already verified, fetch data (prevent loop by ref)
  useEffect(() => {
    if (isLoggedIn && admin?.role === 'teacher' && adminVerified) {
      fetchClasses();
      if (!joinRequestsFetchedRef.current) {
        joinRequestsFetchedRef.current = true;
        fetchJoinRequests();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, admin?.role, adminVerified]);

  // Fetch students separately when admin is verified (prevent loop by ref)
  useEffect(() => {
    if (isLoggedIn && admin?.role === 'teacher' && adminVerified) {
      fetchAllStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, admin?.role, adminVerified]);

  useEffect(() => {
    if (isLoggedIn) {
      if (!adminVerified) {
        setShowAdminPasswordModal(true);
      }
    }
  }, [isLoggedIn, adminVerified]);

  const handleAdminVerified = async () => {
    setAdminVerified(true);
    setShowAdminPasswordModal(false);
    fetchClasses();
    fetchAllStudents();
    fetchJoinRequests();
  };

  const handleAdminFormSubmit = async (e) => {
    e.preventDefault();
    setAdminFormLoading(true);
    setAdminFormError('');
    let result;
    if (showAdminLogin) {
      result = await adminLogin(adminEmail, adminPassword);
    } else {
      result = await adminRegister({ username: adminUsername, email: adminEmail, password: adminPassword });
    }
    setAdminFormLoading(false);
    if (result?.success) {
      setAdminEmail('');
      setAdminPassword('');
      setAdminUsername('');
      setShowAdminPasswordModal(true);
    } else {
      setAdminFormError(result?.message || 'Something went wrong');
    }
  };

  const goToClassDetail = (cls) => {
    navigate(`/admin/classes/${cls.id}`);
  };

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

  const viewClassOverview = async (cls) => {
    setSelectedClass(cls);
    setShowAddStudent(false);
    setClassOverview(null);
    try {
      const res = await axios.get(`/admin/classes/${cls.id}/overview`, adminAuthHeaders());
      const data = res.data.data;
      setClassOverview(data);
      let studentsData = [];
      if (data && Array.isArray(data.students)) studentsData = data.students;
      else if (data && Array.isArray(data.data)) studentsData = data.data;
      const studentsWithOnline = (studentsData || []).map(s => ({ ...s, isOnline: isUserOnline(s.id) }));
      setClassStudents(studentsWithOnline);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error loading class overview', 'error');
    }
  };

  const handleGlobalAddStudent = async () => {
    const { username, email, password } = globalNewStudent;
    if (!email.trim() || !username.trim() || !password) return;
    try {
      const res = await axios.post('/admin/students', { username: username.trim(), email: email.trim(), password });
      showMsg(res.data?.message || 'Student added successfully!');
      setGlobalNewStudent({ username: '', email: '', password: '' });
      setShowGlobalAddStudent(false);
      fetchAllStudents();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error adding student', 'error');
    }
  };

  const handleAddStudentByEmail = async () => {
    if (!addStudentEmail.trim() || !selectedClass) return;
    try {
      const res = await axios.post(`/admin/classes/${selectedClass.id}/add-student`, 
        { email: addStudentEmail.trim() }, adminAuthHeaders());
      showMsg(res.data?.message || 'Added successfully!');
      setAddStudentEmail('');
      await Promise.all([fetchAllStudents(), viewClassOverview(selectedClass)]);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error adding student', 'error');
    }
  };

  const handleAddExistingStudent = async (studentId) => {
    if (!selectedClass) return;
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;
    try {
      await axios.post(`/admin/classes/${selectedClass.id}/add-student`, { email: student.email }, adminAuthHeaders());
      showMsg('Student added to class successfully!');
      setClassStudents(prev => {
        if (prev.some(s => s.id === studentId)) return prev;
        return [{ ...student, isOnline: isUserOnline(studentId), stats: { totalTasks: 0, completed: 0, inProgress: 0, assigned: 0, late: 0, progressPercent: 0 }, goals: { totalGoals: 0, completedGoals: 0, targetHours: 0, achievedHours: 0, goalPercent: 0 }, joinedAt: new Date().toISOString() }, ...prev];
      });
      setClassList(prev => prev.map(c => c.id === selectedClass.id ? { ...c, members: [...(c.members || []), { id: studentId }] } : c));
      if (classOverview) setClassOverview(prev => ({ ...prev, totalStudents: (prev.totalStudents || 0) + 1 }));
    } catch (err) {
      console.error('Add student error:', err.response?.data || err.message);
      showMsg(err.response?.data?.message || 'Error adding student', 'error');
    }
  };

  const getOnlineCount = () => {
    if (selectedClass) return classStudents.filter(s => s.isOnline).length;
    return allStudents.filter(s => s.isOnline).length;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative z-10 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 002 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-2">{showAdminLogin ? 'Sign in with your teacher account' : 'Create a new teacher account'}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <p className="text-xs text-amber-700 font-medium">Separate login. Login here again even if already logged in as teacher.</p>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl">
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 002 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <p className="text-xs text-slate-200 font-medium">Admin password: <span className="font-bold text-white">admin123</span></p>
            </div>
          </div>
          <form onSubmit={handleAdminFormSubmit} className="flex flex-col gap-4">
            {!showAdminLogin && (
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Username</label>
                <input type="text" className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Enter username" required value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email Address</label>
              <input type="email" className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="teacher@email.com" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Password</label>
              <input type="password" className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Enter password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
            </div>
            {adminFormError && <p className="text-red-500 text-xs font-medium text-center bg-red-50 p-2 rounded-lg">{adminFormError}</p>}
            <button type="submit" disabled={adminFormLoading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {adminFormLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Please wait...
                </span>
              ) : (showAdminLogin ? 'Sign in to Admin' : 'Create Teacher Account')}
            </button>
          </form>
          <div className="mt-6 text-xs text-center text-gray-500 border-t border-gray-100 pt-5">
            {showAdminLogin ? "Don't have a teacher account?" : "Already have a teacher account?"}
            <button type="button" onClick={() => { setShowAdminLogin(!showAdminLogin); setAdminFormError(''); setAdminEmail(''); setAdminPassword(''); setAdminUsername(''); }} className="text-indigo-600 font-bold ml-1 hover:text-indigo-700 transition-colors focus:outline-none">
              {showAdminLogin ? 'Register here' : 'Login here'}
            </button>
          </div>
          <div className="mt-4 text-center">
            <a href="/dashboard" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors underline underline-offset-2">← Back to main site</a>
          </div>
        </div>
      </div>
    );
  }

  // Show password modal first before checking role
  if (isLoggedIn && !adminVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <AdminPasswordModal isOpen={showAdminPasswordModal} onClose={() => setShowAdminPasswordModal(false)} onVerified={handleAdminVerified} />
      </div>
    );
  }

  if (admin?.role !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-xl border border-red-100 max-w-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-3">Access Denied</h1>
          <p className="text-sm text-slate-500 mb-8">Only teacher accounts can access the admin dashboard</p>
          <button onClick={adminLogout} className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold text-sm hover:from-red-700 hover:to-orange-700 transition-all shadow-lg shadow-red-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout & Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredAllStudents = filterOnline === 'all' ? allStudents : allStudents.filter(s => filterOnline === 'online' ? s.isOnline : !s.isOnline);

  const StudentCard = ({ s, showAddToClass }) => {
    const inClass = selectedClass && classStudents.some(cs => cs.id === s.id);
    return (
      <div className={`group bg-white rounded-xl px-5 py-4 border transition-all duration-200 flex items-center justify-between hover:shadow-md ${inClass ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 hover:border-indigo-200'}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-bold text-indigo-600 shadow-sm">
              {s.username?.[0]?.toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${s.isOnline ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-gray-300'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-slate-800">{s.username}</p>
              {inClass && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">MEMBER</span>}
            </div>
            <p className="text-xs text-slate-400">{s.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium border transition-colors ${s.isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${s.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            {s.isOnline ? 'Online' : 'Offline'}
          </span>
          {showAddToClass && !inClass && (
            <button onClick={(e) => { e.stopPropagation(); handleAddExistingStudent(s.id); }}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300">
              + Add
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
      
      {message && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-300 animate-fadeIn flex items-center gap-2 ${
          message.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200' : 
          message.type === 'info' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-200' :
          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200'
        }`}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {message.type === 'error' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : message.type === 'info' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 002 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">Manage classes and students</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <span className="text-sm text-slate-600 font-medium">{admin?.username}</span>
            </div>
            <button onClick={adminLogout} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all shadow-sm hover:shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm text-slate-600">{getOnlineCount()} <span className="font-semibold text-green-600">online</span></span>
              </div>
              <span className="text-sm text-slate-400">/</span>
              <span className="text-sm text-slate-600"><span className="font-bold text-indigo-600">{selectedClass ? classStudents.length : allStudents.length}</span> total</span>
            </div>
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button onClick={() => setFilterOnline('all')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${filterOnline === 'all' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
              <button onClick={() => setFilterOnline('online')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${filterOnline === 'online' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Online</button>
              <button onClick={() => setFilterOnline('offline')} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${filterOnline === 'offline' ? 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Offline</button>
            </div>
            {selectedClass && (
              <button onClick={() => { setShowAddStudent(!showAddStudent); setAddStudentEmail(''); }} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-xs font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md shadow-emerald-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Add Student
              </button>
            )}
          </div>
        </div>

        {/* Join Requests Section */}
        <div className="mb-8">
          <button
            onClick={toggleJoinRequests}
            className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all w-full text-left group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${joinRequests.length > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
              <svg className={`w-5 h-5 ${joinRequests.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Join Requests</span>
              {joinRequests.length > 0 && !showJoinRequests && (
                <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">{joinRequests.length} pending</span>
              )}
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showJoinRequests ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showJoinRequests && (
            <div className="mt-3 bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                </div>
              ) : joinRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No pending join requests</p>
                  <p className="text-xs text-slate-400 mt-1">When students request to join, they'll appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-amber-50">
                  {joinRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between px-6 py-4 hover:bg-amber-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-sm font-bold text-amber-600 shadow-sm">
                          {req.studentName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{req.studentName || 'Unknown'}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{req.studentEmail || ''}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="font-medium text-indigo-500">{req.className || 'Unknown class'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{req.requestedAt ? formatDate(req.requestedAt) : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-200 hover:shadow-lg"
                        >
                          <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-4 py-2 bg-white text-red-500 border border-red-200 hover:bg-red-50 rounded-xl text-xs font-bold transition-all"
                        >
                          <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Classes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800">Classes</h2>
              </div>
            </div>

            <div onClick={() => navigate('/admin/classes')}
              className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-500 group-hover:to-purple-600 flex items-center justify-center mx-auto mb-5 transition-all duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">Manage Classes</h3>
                <p className="text-sm text-slate-400">Create, view, and manage your classes</p>
                <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-300">
                  <span>Get Started</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Students */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{selectedClass ? `Students - ${selectedClass.name}` : 'All Students'}</h2>
              </div>
            </div>

            {showAddStudent && selectedClass && (
              <div className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-sm animate-fadeIn">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  Add Student by Email
                </h3>
                <div className="flex gap-3">
                  <input value={addStudentEmail} onChange={e => setAddStudentEmail(e.target.value)} placeholder="student@email.com" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" onKeyDown={e => e.key === 'Enter' && handleAddStudentByEmail()} />
                  <button onClick={handleAddStudentByEmail} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-200">Add by Email</button>
                  <button onClick={() => { setShowAddStudent(false); setAddStudentEmail(''); }} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Click "+ Add" next to a student not yet in class below:</p>
                </div>
              </div>
            )}

            {allStudents.length === 0 && !showGlobalAddStudent ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-slate-500 font-medium">No students in the system yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Add your first student to get started</p>
                <button onClick={() => setShowGlobalAddStudent(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md">
                  + Add First Student
                </button>
              </div>
            ) : allStudents.length === 0 && showGlobalAddStudent ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                <p className="text-slate-800 font-bold mb-4">Add New Student</p>
                <div className="flex flex-col gap-2 max-w-md mx-auto">
                  <input value={globalNewStudent.username} onChange={e => setGlobalNewStudent({ ...globalNewStudent, username: e.target.value })} placeholder="Username" className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                  <input value={globalNewStudent.email} onChange={e => setGlobalNewStudent({ ...globalNewStudent, email: e.target.value })} placeholder="student@email.com" className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" onKeyDown={e => e.key === 'Enter' && handleGlobalAddStudent()} />
                  <input value={globalNewStudent.password} onChange={e => setGlobalNewStudent({ ...globalNewStudent, password: e.target.value })} type="password" placeholder="Password (min 6 characters)" className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" onKeyDown={e => e.key === 'Enter' && handleGlobalAddStudent()} />
                  <div className="flex gap-2">
                    <button onClick={handleGlobalAddStudent} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">Add Student</button>
                    <button onClick={() => { setShowGlobalAddStudent(false); setGlobalNewStudent({ username: '', email: '', password: '' }); }} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-200">Cancel</button>
                  </div>
                </div>
              </div>
            ) : filteredAllStudents.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                <p className="text-slate-500 font-medium">No {filterOnline === 'online' ? 'online' : 'offline'} students found</p>
                <p className="text-xs text-slate-400 mt-1">Try switching to a different filter</p>
              </div>
            ) : (
              <>
                {selectedClass && classOverview && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-indigo-100 shadow-sm grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-indigo-50/50">
                      <p className="text-2xl font-bold text-indigo-600">{classOverview.totalStudents}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Students</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50/50">
                      <p className="text-2xl font-bold text-emerald-600">{classOverview.totalTasks}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Tasks</p>
                    </div>
                    <div className="p-3 rounded-lg bg-sky-50/50">
                      <p className="text-2xl font-bold text-sky-600">{getOnlineCount()}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Online</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50/50">
                      <p className="text-2xl font-bold text-amber-600">{classOverview.classInfo?.isActive ? 'Active' : 'Inactive'}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Status</p>
                    </div>
                  </div>
                )}
                <div className="overflow-y-auto max-h-[600px] scrollbar-hide border border-slate-100 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm">
                  <div className="grid gap-2 p-3">
                    {filteredAllStudents.map(s => <StudentCard key={s.id} s={s} showAddToClass={!!selectedClass} />)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;