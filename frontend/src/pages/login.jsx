import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
  /* ── Reset & Body ─────────────────────────────────── */
  body {
    margin: 0;
    min-height: 100vh;
    background-image: url('/studying.avif');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-attachment: fixed;
    color: #1A1A1A;
  }

  /* Overlay tối nhẹ lên ảnh để form nổi bật hơn */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 0;
  }

  /* ── Login Body ────────────────────────────────────── */
  .login-body {
    background: transparent;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  /* ── Container ─────────────────────────────────────── */
  .login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
    width: 100%;
  }

  .login-container h1 {
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
    text-align: center;
    color: #ffffff;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
  }

  /* ── Form card ─────────────────────────────────────── */
  .register-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    max-width: 380px;
    margin: 24px auto;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 44px 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-sizing: border-box;
  }

  /* ── Form fields ───────────────────────────────────── */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #1A1A1A;
  }

  .form-group input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #D1D5DB;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: inherit;
    background: #fff;
    color: #1A1A1A;
  }

  .form-group input:focus {
    border-color: #5d5cde;
    box-shadow: 0 0 0 3px rgba(93, 92, 222, 0.15);
  }

  /* ── Login button ──────────────────────────────────── */
  .login-button {
    width: 100%;
    background-color: #5d5cde;
    color: #fff;
    border: none;
    padding: 12px 20px;
    text-align: center;
    display: block;
    font-size: 15px;
    margin-top: 6px;
    cursor: pointer;
    border-radius: 10px;
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    transition: background 0.15s, opacity 0.15s, transform 0.1s;
    letter-spacing: 0.01em;
  }

  .login-button:hover    { background-color: #4a49c4; transform: translateY(-1px); }
  .login-button:active   { transform: translateY(0); }
  .login-button:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  /* ── Links ─────────────────────────────────────────── */
  .login-link-row {
    text-align: center;
    margin-top: 10px;
    font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #444;
  }

  .login-link-row a {
    color: #5d5cde;
    text-decoration: none;
    font-weight: 600;
  }

  .login-link-row a:hover { text-decoration: underline; }

  /* ── Alerts ────────────────────────────────────────── */
  .login-error {
    background: #ffdad6;
    color: #93000a;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 12px;
    border-radius: 8px;
    text-align: center;
  }

  .login-success {
    background: #e8f5e9;
    color: #2e7d32;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 12px;
    border-radius: 8px;
    text-align: center;
  }
`;



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validate kiểm tra rỗng
    if (email.trim() === '' || password.trim() === '') {
      setError('Please fulfill your information');
      return;
    }

    setLoading(true);

    try {
      // 2. GỌI API LÊN BACKEND THỰC TẾ
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // CHÚ Ý: Nếu Database của bạn dùng 'email' thay vì 'username' để đăng nhập, 
        // hãy đổi chữ 'username:' ở dòng dưới thành 'email:'
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password 
        }),
      });

      // Lấy dữ liệu Backend trả về
      const data = await response.json();

      // 3. KIỂM TRA PHẢN HỒI TỪ BACKEND
      if (response.ok) {
        // Đăng nhập thành công -> Lưu trạng thái vào localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email.trim());
        
        // Lưu Token bảo mật do Backend cấp
        if (data.token) {
          localStorage.setItem('accessToken', data.token);
        }

        setSuccess('Login successfully!');
        
        // Chuyển hướng sang trang chủ sau 0.8 giây
        setTimeout(() => navigate('/'), 800);
      } else {
        // Backend báo lỗi (sai mật khẩu, tài khoản không tồn tại...)
        setError(data.message || 'Username or password is wrong or does not exist!');
      }
    } catch (err) {
      console.error("Login Error: ", err);
      setError('Cannot connect to the server. Please make sure your backend is running.');
    } finally {
      // Tắt trạng thái loading dù thành công hay thất bại
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-body">
        <div className="login-container">
          <h1>Welcome to Study Tracker</h1>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error   && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

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

          <br />

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <br />

          <p className="login-link-row">
            Don't have an account? <a href="/register">Register here</a>.
          </p>
        </form>
      </div>
    </>
  );
}