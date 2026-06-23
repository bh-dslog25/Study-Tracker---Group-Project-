import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../frontend/src/api/axios';

const styles = `
  .register-body {
    min-height: 100vh;
    margin: 0;

    
    background-color: #f0f0f7;
    color: #1A1A1A;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .signup-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
  }

  .signup-container h1 {
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
    text-align: center;
    color: #1A1A1A;
  }

  .signup-container h2 {
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
    text-align: center;
    color: #1A1A1A;
  }

  .register-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    max-width: 350px;
    margin: 40px auto;
    background-color: #F8F9FD;
    padding: 50px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #E5E7EB;
    box-sizing: border-box;
  }

  .form-group {
    padding-left: 1%;
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 6px;
    color: #1A1A1A;
  }

  .form-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
    font-family: inherit;
    background: #fff;
  }

  .form-group input:focus {
    border-color: #5d5cde;
    box-shadow: 0 0 0 2px rgba(93, 92, 222, 0.15);
  }

  .register-button {
    background-color: #5d5cde;
    color: white;
    border: none;
    padding: 12px 20px;
    text-align: center;
    text-decoration: none;
    display: block;
    font-size: 16px;
    margin: 1px 40px;
    cursor: pointer;
    border-radius: 8px;
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    transition: background 0.15s, opacity 0.15s;
    width: calc(100% - 80px);
  }

  .register-button:hover    { background-color: #4a49c4; }
  .register-button:disabled { opacity: 0.7; cursor: not-allowed; }

  .register-link-row {
    text-align: center;
    margin-top: 8px;
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #1A1A1A;
  }

  .register-link-row a {
    color: #5d5cde;
    text-decoration: none;
    font-weight: 600;
  }

  .register-link-row a:hover { text-decoration: underline; }

  .register-error {
    background: #ffdad6;
    color: #93000a;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 12px;
    border-radius: 8px;
    text-align: center;
  }

  .register-success {
    background: #e8f5e9;
    color: #2e7d32;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 12px;
    border-radius: 8px;
    text-align: center;
  }

  body::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;

    background-color: rgba(255, 255, 255, 0.5); /* Semi-transparent white background */
    background-image: url('studying.avif');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-attachment: fixed;
  
    margin: 0;


    filter: blur(5px); /* Lệnh làm mờ ở đây */
    z-index: -1; /* Đẩy nó nằm dưới cùng */
    transform: scale(1.1); /* Phóng to một chút để không bị lộ viền trắng khi mờ */
}

`;

export default function Register() {
  const [username,        setUsername]        = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email,           setEmail]           = useState('');
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [loading,         setLoading]         = useState(false);
  const navigate = useNavigate();

  // Đổi thành async function để gọi API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validate rỗng
    if (!username.trim() || !password.trim() || !confirmPassword.trim() || !email.trim()) {
      setError('Please fulfill your information !');
      return;
    }

    // 2. Validate confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match !');
      return;
    }

    setLoading(true);

    try {
      // 3. GỌI API LÊN BACKEND THỰC TẾ
      // Thay vì lưu vào localStorage, ta gửi dữ liệu lên server Node.js
      const response = await api.post('/auth/register', {
        username: username.trim(),
        email: email.trim(),
        password,
      });
      const data = response?.data || response;

      if (data?.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      setSuccess('Register successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error("Register Error: ", err);
      setError(err?.message || 'Cannot connect to the server. Please make sure your backend is running.');
    } finally {
      // Dù thành công hay thất bại cũng tắt trạng thái loading
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="register-body">
        <div className="signup-container">
          <h1>Welcome to Study Tracker</h1>
          <h2>You are a newbie? Welcome to our study tracker!</h2>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error   && <div className="register-error">{error}</div>}
          {success && <div className="register-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password:</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <br />

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <br />

          <p className="register-link-row">
            Already have an account? <a href="/login">Login here</a>.
          </p>
        </form>
      </div>
    </>
  );
}

