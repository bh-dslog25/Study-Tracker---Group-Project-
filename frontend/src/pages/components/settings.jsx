import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loadUserJSON, saveUserJSON } from '../../utils/storage';
import './Settings.css';

// ── Icons ─────────────────────────────────────────────
const IconPerson  = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconBell    = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconPalette = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10c0 2-1.5 3-3 3h-2c-1.5 0-2 1-2 2a2 2 0 0 1-2 2 10 10 0 0 1 0-20z"/><circle cx="8.5" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="12" cy="6" r="1" fill="currentColor"/></svg>;
const IconShield  = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconCamera  = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconEye     = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff  = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconCheck   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;

// ── Theme helpers ─────────────────────────────────────
const ACCENT_PALETTES = {
  '#3525cd': { light: '#3525cd', dark: '#7b6ef6' },
  '#00897b': { light: '#00897b', dark: '#4db6ac' },
  '#e53935': { light: '#e53935', dark: '#ef9a9a' },
  '#f57c00': { light: '#f57c00', dark: '#ffb74d' },
  '#8e24aa': { light: '#8e24aa', dark: '#ce93d8' },
};

const ACCENT_NAMES = {
  '#3525cd': 'Indigo',
  '#00897b': 'Teal',
  '#e53935': 'Red',
  '#f57c00': 'Orange',
  '#8e24aa': 'Purple',
};

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (theme, accentKey) => {
  const root = document.documentElement;
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const accentColor = ACCENT_PALETTES[accentKey]?.[resolved] ?? accentKey;

  root.setAttribute('data-theme', resolved);
  root.style.setProperty('--accent', accentColor);
  root.style.setProperty('--accent-hover', accentColor + 'cc');

  if (resolved === 'dark') {
    root.style.setProperty('--bg-page',    '#0f1117');
    root.style.setProperty('--bg-card',    '#1a1d27');
    root.style.setProperty('--bg-input',   '#242736');
    root.style.setProperty('--border',     '#2e3245');
    root.style.setProperty('--text-main',  '#e8eaf6');
    root.style.setProperty('--text-sub',   '#9095b0');
    root.style.setProperty('--text-label', '#6b7099');
  } else {
    root.style.setProperty('--bg-page',    '#f0f2fa');
    root.style.setProperty('--bg-card',    '#ffffff');
    root.style.setProperty('--bg-input',   '#f7f8ff');
    root.style.setProperty('--border',     '#e4e7f5');
    root.style.setProperty('--text-main',  '#12142a');
    root.style.setProperty('--text-sub',   '#5a5f80');
    root.style.setProperty('--text-label', '#8a8faa');
  }
};

// ── Toggle ────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`toggle-switch ${checked ? 'on' : ''}`}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

// ── Sections config ───────────────────────────────────
const SECTIONS = [
  { id: 'profile',    label: 'Hồ sơ',            icon: <IconPerson /> },
  { id: 'notif',      label: 'Thông báo',         icon: <IconBell /> },
  { id: 'appearance', label: 'Giao diện',          icon: <IconPalette /> },
  { id: 'security',   label: 'Bảo mật tài khoản', icon: <IconShield /> },
];

const KEY = 'study_tracker_settings';

// ── Helper: lấy uid từ user object ───────────────────
// Dùng id nếu có, fallback sang email để đảm bảo unique
const getUid = (user) => user?.id || user?.email || 'guest';

// ── Profile Section ───────────────────────────────────
function ProfileSection() {
  const { user, updateUser } = useAuth();
  const uid = getUid(user);

  const [name,   setName]   = useState(user?.username || '');
  const [email,  setEmail]  = useState(user?.email    || '');
  const [bio,    setBio]    = useState(user?.bio       || '');
  const [avatar, setAvatar] = useState(user?.avatar   || null);
  const [saved,  setSaved]  = useState(false);
  const fileRef = useRef();

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (updateUser) updateUser({ username: name, email, bio, avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setName(user?.username || '');
    setEmail(user?.email   || '');
    setBio(user?.bio       || '');
    setAvatar(user?.avatar || null);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Thông tin hồ sơ</h2>
        <p className="section-desc">Cập nhật thông tin cá nhân.</p>
      </div>
      <div className="section-body">
        {/* Avatar */}
        <div className="avatar-row">
          <div className="avatar-wrap" onClick={() => fileRef.current.click()}>
            {avatar
              ? <img src={avatar} alt="avatar" className="avatar-img" />
              : <span className="avatar-placeholder"><IconPerson /></span>}
            <div className="avatar-overlay"><IconCamera /></div>
          </div>
          <div>
            <button className="btn-outline" onClick={() => fileRef.current.click()} type="button">
              Thay ảnh đại diện
            </button>
            <p className="hint-text">JPG, GIF hoặc PNG. Tối đa 2MB.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
        </div>

        {/* Name + Email */}
        <div className="field-grid">
          <div className="field">
            <label className="field-label">HỌ VÀ TÊN</label>
            <input className="field-input" type="text" value={name}
              onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">ĐỊA CHỈ EMAIL</label>
            <input className="field-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        {/* Bio */}
        <div className="field">
          <label className="field-label">TIỂU SỬ</label>
          <textarea className="field-input field-textarea" rows={3}
            maxLength={200} value={bio} onChange={e => setBio(e.target.value)} />
          <p className="char-count">{bio.length}/200 ký tự</p>
        </div>
      </div>
      <div className="section-footer">
        <button className="btn-outline" onClick={handleCancel} type="button">Hủy bỏ</button>
        <button className={`btn-primary ${saved ? 'btn-saved' : ''}`} onClick={handleSave} type="button">
          {saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}

// ── Notifications Section ─────────────────────────────
function NotificationsSection() {
  const { user } = useAuth();
  const uid = getUid(user);

  const [settings, setSettings] = useState(() =>
    loadUserJSON(KEY, uid, {
      daily: true, deadline: true, weekly: false, goals: true, focus: false,
    })
  );

  const toggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveUserJSON(KEY, uid, updated);
  };

  const items = [
    { key: 'daily',    title: 'Nhắc nhở hàng ngày',      desc: 'Nhận tóm tắt các nhiệm vụ cần làm hôm nay.' },
    { key: 'deadline', title: 'Hạn chót nhiệm vụ',        desc: 'Thông báo cho các nhiệm vụ cần hoàn thành trong vòng 24 giờ.' },
    { key: 'weekly',   title: 'Báo cáo hàng tuần',         desc: 'Tóm tắt số giờ học và mục tiêu đã hoàn thành.' },
    { key: 'goals',    title: 'Mốc mục tiêu',             desc: 'Thông báo khi bạn đạt được một mốc mục tiêu.' },
    { key: 'focus',    title: 'Kết thúc phiên tập trung', desc: 'Thông báo khi phiên tập trung của bạn đã hoàn thành.' },
  ];

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Tùy chọn thông báo</h2>
        <p className="section-desc">Kiểm soát cách và khi nào bạn muốn được thông báo.</p>
      </div>
      <div className="section-body notif-list">
        {items.map((item, i) => (
          <div key={item.key} className={`notif-item ${i > 0 ? 'border-top' : ''}`}>
            <div>
              <h4 className="notif-title">{item.title}</h4>
              <p className="notif-desc">{item.desc}</p>
            </div>
            <Toggle checked={settings[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Appearance Section ────────────────────────────────
function AppearanceSection() {
  const { user } = useAuth();
  const uid = getUid(user);

  const [theme,  setTheme]  = useState(() => loadUserJSON(`${KEY}_theme`,  uid, 'light'));
  const [accent, setAccent] = useState(() => loadUserJSON(`${KEY}_accent`, uid, '#3525cd'));
  const [saved,  setSaved]  = useState(false);

  // Áp dụng theme đã lưu khi mount
  useEffect(() => {
    applyTheme(theme, accent);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Lắng nghe thay đổi hệ thống khi chọn "system"
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system', accent);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, accent]);

  const handleThemeChange = (t) => {
    setTheme(t);
    applyTheme(t, accent);
  };

  const handleAccentChange = (c) => {
    setAccent(c);
    applyTheme(theme, c);
  };

  const handleSave = () => {
    saveUserJSON(`${KEY}_theme`,  uid, theme);
    saveUserJSON(`${KEY}_accent`, uid, accent);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeOptions = [
    { value: 'light',  label: '☀ Light' },
    { value: 'dark',   label: '🌙 Dark' },
    { value: 'system', label: '💻 System' },
  ];

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Giao diện</h2>
        <p className="section-desc">Tùy chỉnh cách StudyTracker hiển thị với bạn.</p>
      </div>
      <div className="section-body">

        {/* Theme */}
        <div className="field">
          <label className="field-label">CHỦ ĐỀ</label>
          <div className="theme-pills">
            {themeOptions.map(t => (
              <button key={t.value} type="button"
                className={`theme-pill ${theme === t.value ? 'selected' : ''}`}
                onClick={() => handleThemeChange(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent */}
        <div className="field">
          <label className="field-label">MÀU CHỦ ĐẠO</label>
          <div className="accent-row">
            {Object.keys(ACCENT_PALETTES).map(c => (
              <button key={c} type="button"
                className={`accent-dot ${accent === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => handleAccentChange(c)}
                title={ACCENT_NAMES[c]}
                aria-label={ACCENT_NAMES[c]}
              >
                {accent === c && <span className="accent-check"><IconCheck /></span>}
              </button>
            ))}
          </div>
          <p className="hint-text" style={{ marginTop: 8 }}>
            Màu đang chọn: <strong>{ACCENT_NAMES[accent]}</strong>
          </p>
        </div>

        {/* Preview */}
        <div className="appearance-preview">
          <div className="preview-bar" style={{ background: ACCENT_PALETTES[accent]?.light ?? accent }}>
            <span className="preview-label">Xem trước màu chủ đạo</span>
            <button className="preview-btn" style={{ background: 'rgba(255,255,255,0.2)' }} type="button">
              Nút mẫu
            </button>
          </div>
        </div>

      </div>
      <div className="section-footer">
        <button type="button"
          className={`btn-primary ${saved ? 'btn-saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? '✓ Đã lưu!' : 'Lưu Giao diện'}
        </button>
      </div>
    </div>
  );
}

// ── Security Section ──────────────────────────────────
function SecuritySection() {
  const { user } = useAuth();
  const uid = getUid(user);

  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [curPw,    setCurPw]    = useState('');
  const [newPw,    setNewPw]    = useState('');
  const [confPw,   setConfPw]   = useState('');
  const [twoFA,    setTwoFA]    = useState(() => loadUserJSON(`${KEY}_two_fa`, uid, false));
  const [msg,      setMsg]      = useState('');

  // Lưu 2FA mỗi khi thay đổi
  useEffect(() => {
    saveUserJSON(`${KEY}_two_fa`, uid, twoFA);
  }, [twoFA, uid]);

  const strength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)            s++;
    if (/[A-Z]/.test(pw))          s++;
    if (/[0-9]/.test(pw))          s++;
    if (/[^A-Za-z0-9]/.test(pw))   s++;
    return s;
  };
  const pw_s = strength(newPw);
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh'][pw_s];
  const strengthColor = ['', '#ba1a1a', '#f57c00', '#fbc02d', '#2e7d32'][pw_s];

  const handleChange = () => {
    if (!curPw || !newPw || !confPw) { setMsg('Vui lòng điền đầy đủ các trường.'); return; }
    if (newPw !== confPw)             { setMsg('Mật khẩu mới không khớp.'); return; }
    if (pw_s < 2)                     { setMsg('Mật khẩu quá yếu.'); return; }
    setMsg('✓ Đổi mật khẩu thành công!');
    setCurPw(''); setNewPw(''); setConfPw('');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Bảo mật Tài khoản</h2>
        <p className="section-desc">Quản lý mật khẩu và cài đặt bảo mật.</p>
      </div>
      <div className="section-body">
        <h3 className="subsection-title">Đổi mật khẩu</h3>

        <div className="field">
          <label className="field-label">MẬT KHẨU HIỆN TẠI</label>
          <div className="pw-wrap">
            <input className="field-input" type={showCur ? 'text' : 'password'}
              value={curPw} onChange={e => setCurPw(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại" />
            <button className="pw-eye" type="button" onClick={() => setShowCur(v => !v)}>
              {showCur ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label">MẬT KHẨU MỚI</label>
            <div className="pw-wrap">
              <input className="field-input" type={showNew ? 'text' : 'password'}
                value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="Tối thiểu 8 ký tự" />
              <button className="pw-eye" type="button" onClick={() => setShowNew(v => !v)}>
                {showNew ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {newPw && (
              <div className="strength-row">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="strength-bar"
                      style={{ background: i <= pw_s ? strengthColor : '#e7eefe' }} />
                  ))}
                </div>
                <span style={{ color: strengthColor, fontSize: 11, fontWeight: 600 }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>
          <div className="field">
            <label className="field-label">XÁC NHẬN MẬT KHẨU</label>
            <div className="pw-wrap">
              <input className="field-input" type={showConf ? 'text' : 'password'}
                value={confPw} onChange={e => setConfPw(e.target.value)}
                placeholder="Nhập lại mật khẩu mới" />
              <button className="pw-eye" type="button" onClick={() => setShowConf(v => !v)}>
                {showConf ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>
        </div>

        {msg && (
          <p className={`msg ${msg.startsWith('✓') ? 'msg-ok' : 'msg-err'}`}>{msg}</p>
        )}

        {/* 2FA */}
        <div className="twofa-row">
          <div>
            <h3 className="subsection-title" style={{ marginBottom: 2 }}>Xác thực hai lớp</h3>
            <p className="notif-desc">Thêm một lớp bảo mật bổ sung cho tài khoản của bạn.</p>
          </div>
          <Toggle checked={twoFA} onChange={setTwoFA} />
        </div>
      </div>

      <div className="section-footer">
        <button className="btn-primary" onClick={handleChange} type="button">
          Cập nhật Mật khẩu
        </button>
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────
export default function Settings() {
  const { user } = useAuth();
  const uid = getUid(user);

  const [active, setActive] = useState(() =>
    loadUserJSON(`${KEY}_active_tab`, uid, 'profile')
  );

  useEffect(() => {
    saveUserJSON(`${KEY}_active_tab`, uid, active);
  }, [active, uid]);

  // Khi uid thay đổi (đổi tài khoản), load lại tab đã lưu của user đó
  useEffect(() => {
    const savedTab = loadUserJSON(`${KEY}_active_tab`, uid, 'profile');
    setActive(savedTab);
  }, [uid]);

  const renderSection = () => {
    switch (active) {
      case 'profile':    return <ProfileSection />;
      case 'notif':      return <NotificationsSection />;
      case 'appearance': return <AppearanceSection />;
      case 'security':   return <SecuritySection />;
      default:           return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-top">
        <h1 className="settings-title">Cài đặt</h1>
        <p className="settings-subtitle">Quản lý cài đặt và tùy chọn tài khoản của bạn.</p>
      </div>

      <div className="settings-layout">
        <aside className="settings-nav">
          {SECTIONS.map(s => (
            <button key={s.id} type="button"
              className={`snav-btn ${active === s.id ? 'active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </aside>

        <div className="settings-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}