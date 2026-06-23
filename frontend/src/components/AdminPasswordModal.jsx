import React, { useState } from 'react';
import authService from '../services/authService';

export default function AdminPasswordModal({ isOpen, onClose, onVerified }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await authService.verifyAdminPassword(password);
      if (result?.verified) {
        setPassword('');
        onVerified?.();
        onClose();
      } else {
        setError(result?.message || 'Incorrect admin password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 relative z-10">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-bold text-xl text-gray-800">Admin Access</h3>
          <p className="text-xs text-gray-500 mt-1">Please enter admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Admin Password</label>
            <div className="relative w-full">
              <input
                className={`w-full border ${error ? 'border-red-300' : 'border-gray-200'} p-2.5 rounded-xl pr-20 text-sm focus:outline-none focus:border-indigo-500`}
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-12 top-3 text-xs font-semibold text-gray-400 hover:text-indigo-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Password'}
          </button>
        </form>
      </div>
    </div>
  );
}