import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

// ── Icons ─────────────────────────────────────────────
const IconPerson   = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconBell     = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconPalette  = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10c0 2-1.5 3-3 3h-2c-1.5 0-2 1-2 2a2 2 0 0 1-2 2 10 10 0 0 1 0-20z"/><circle cx="8.5" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="12" cy="6" r="1" fill="currentColor"/></svg>;
const IconShield   = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconCamera   = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconEye      = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

// ── Toggle component ──────────────────────────────────
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

// ── Sections ──────────────────────────────────────────
const SECTIONS = [
  { id: 'profile',    label: 'Profile',          icon: <IconPerson /> },
  { id: 'notif',      label: 'Notifications',    icon: <IconBell /> },
  { id: 'appearance', label: 'Appearance',       icon: <IconPalette /> },
  { id: 'security',   label: 'Account Security', icon: <IconShield /> },
];

// ── Profile Section ───────────────────────────────────
function ProfileSection() {
  const { user, updateUser } = useAuth();
  const [name, setName]     = useState(user?.username || 'Alex Student');
  const [email, setEmail]   = useState(user?.email || 'alex@example.edu');
  const [bio, setBio]       = useState(user?.bio || 'Computer Science major focusing on AI. Usually found in the library on Tuesdays.');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [saved, setSaved]   = useState(false);
  const fileRef = useRef();

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (updateUser) {
      updateUser({ username: name, email, bio, avatar });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Profile Information</h2>
        <p className="section-desc">Update your personal details and how others see you.</p>
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
            <button className="btn-outline" onClick={() => fileRef.current.click()}>Change Avatar</button>
            <p className="hint-text">JPG, GIF or PNG. Max size of 2MB.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
        </div>

        {/* Name + Email */}
        <div className="field-grid">
          <div className="field">
            <label className="field-label">FULL NAME</label>
            <input className="field-input" type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">EMAIL ADDRESS</label>
            <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        {/* Bio */}
        <div className="field">
          <label className="field-label">STUDY BIO</label>
          <textarea className="field-input field-textarea" rows={3}
            maxLength={200}
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
          <p className="char-count">{bio.length}/200 characters</p>
        </div>
      </div>
      <div className="section-footer">
        <button className="btn-outline" onClick={() => { 
          setName(user?.username || 'Alex Student'); 
          setEmail(user?.email || 'alex@example.edu'); 
          setBio(user?.bio || 'Computer Science major focusing on AI. Usually found in the library on Tuesdays.'); 
          setAvatar(user?.avatar || null);
        }}>
          Cancel
        </button>
        <button className={`btn-primary ${saved ? 'btn-saved' : ''}`} onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ── Notifications Section ─────────────────────────────
function NotificationsSection() {
  const [settings, setSettings] = useState({
    daily:    true,
    deadline: true,
    weekly:   false,
    goals:    true,
    focus:    false,
  });
  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

  const items = [
    { key: 'daily',    title: 'Daily Reminders',      desc: 'Get a summary of tasks due today.' },
    { key: 'deadline', title: 'Task Deadlines',        desc: 'Alerts for tasks due in less than 24 hours.' },
    { key: 'weekly',   title: 'Weekly Report',         desc: 'Summary of study hours and completed goals.' },
    { key: 'goals',    title: 'Goal Milestones',       desc: 'Notify when you reach a goal milestone.' },
    { key: 'focus',    title: 'Focus Session End',     desc: 'Alert when your focus session is complete.' },
  ];

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Notification Preferences</h2>
        <p className="section-desc">Control how and when you want to be notified.</p>
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
  const [theme, setTheme]   = useState('light');
  const [accent, setAccent] = useState('#3525cd');
  const [font, setFont]     = useState('plus-jakarta');

  const accents = ['#3525cd','#00897b','#e53935','#f57c00','#8e24aa'];

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Appearance</h2>
        <p className="section-desc">Customize how StudyTracker looks for you.</p>
      </div>
      <div className="section-body">
        {/* Theme */}
        <div className="field">
          <label className="field-label">THEME</label>
          <div className="theme-pills">
            {['light','dark','system'].map(t => (
              <button key={t}
                className={`theme-pill ${theme === t ? 'selected' : ''}`}
                onClick={() => setTheme(t)}
              >
                {t === 'light' ? '☀ Light' : t === 'dark' ? '🌙 Dark' : '💻 System'}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div className="field">
          <label className="field-label">ACCENT COLOR</label>
          <div className="accent-row">
            {accents.map(c => (
              <button key={c}
                className={`accent-dot ${accent === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setAccent(c)}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="field">
          <label className="field-label">FONT</label>
          <select className="field-input" value={font} onChange={e => setFont(e.target.value)}>
            <option value="plus-jakarta">Plus Jakarta Sans</option>
            <option value="inter">Inter</option>
            <option value="roboto">Roboto</option>
            <option value="system">System Default</option>
          </select>
        </div>
      </div>
      <div className="section-footer">
        <button className="btn-primary" onClick={() => {}}>Save Appearance</button>
      </div>
    </div>
  );
}

// ── Security Section ──────────────────────────────────
function SecuritySection() {
  const [showCur, setShowCur]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [curPw, setCurPw]       = useState('');
  const [newPw, setNewPw]       = useState('');
  const [confPw, setConfPw]     = useState('');
  const [twoFA, setTwoFA]       = useState(false);
  const [msg, setMsg]           = useState('');

  const strength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)        s++;
    if (/[A-Z]/.test(pw))      s++;
    if (/[0-9]/.test(pw))      s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const pw_s = strength(newPw);
  const strengthLabel = ['','Weak','Fair','Good','Strong'][pw_s];
  const strengthColor = ['','#ba1a1a','#f57c00','#fbc02d','#2e7d32'][pw_s];

  const handleChange = () => {
    if (!curPw || !newPw || !confPw) { setMsg('Please fill all fields.'); return; }
    if (newPw !== confPw)             { setMsg('Passwords do not match.'); return; }
    if (pw_s < 2)                     { setMsg('Password too weak.'); return; }
    setMsg('✓ Password changed successfully!');
    setCurPw(''); setNewPw(''); setConfPw('');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Account Security</h2>
        <p className="section-desc">Manage your password and security settings.</p>
      </div>
      <div className="section-body">
        {/* Password */}
        <h3 className="subsection-title">Change Password</h3>
        <div className="field">
          <label className="field-label">CURRENT PASSWORD</label>
          <div className="pw-wrap">
            <input className="field-input" type={showCur ? 'text' : 'password'}
              value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="Enter current password" />
            <button className="pw-eye" onClick={() => setShowCur(v => !v)}>
              {showCur ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </div>
        <div className="field-grid">
          <div className="field">
            <label className="field-label">NEW PASSWORD</label>
            <div className="pw-wrap">
              <input className="field-input" type={showNew ? 'text' : 'password'}
                value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" />
              <button className="pw-eye" onClick={() => setShowNew(v => !v)}>
                {showNew ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {newPw && (
              <div className="strength-row">
                <div className="strength-bars">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="strength-bar"
                      style={{ background: i <= pw_s ? strengthColor : '#e7eefe' }} />
                  ))}
                </div>
                <span style={{ color: strengthColor, fontSize:11, fontWeight:600 }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <div className="field">
            <label className="field-label">CONFIRM PASSWORD</label>
            <div className="pw-wrap">
              <input className="field-input" type={showConf ? 'text' : 'password'}
                value={confPw} onChange={e => setConfPw(e.target.value)} placeholder="Repeat new password" />
              <button className="pw-eye" onClick={() => setShowConf(v => !v)}>
                {showConf ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>
        </div>
        {msg && <p className={`msg ${msg.startsWith('✓') ? 'msg-ok' : 'msg-err'}`}>{msg}</p>}

        {/* 2FA */}
        <div className="twofa-row">
          <div>
            <h3 className="subsection-title" style={{marginBottom:2}}>Two-Factor Authentication</h3>
            <p className="notif-desc">Add an extra layer of security to your account.</p>
          </div>
          <Toggle checked={twoFA} onChange={setTwoFA} />
        </div>
      </div>
      <div className="section-footer">
        <button className="btn-primary" onClick={handleChange}>Update Password</button>
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────
export default function Settings() {
  const [active, setActive] = useState('profile');

  const renderSection = () => {
    switch(active) {
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
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account settings and preferences.</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar nav */}
        <aside className="settings-nav">
          {SECTIONS.map(s => (
            <button key={s.id}
              className={`snav-btn ${active === s.id ? 'active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="settings-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}