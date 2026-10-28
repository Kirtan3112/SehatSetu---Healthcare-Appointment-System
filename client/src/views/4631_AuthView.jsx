import React, { useState } from 'react';
import { api, setStoredToken } from '../services/4631_api';
import { 
  Activity, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sun,
  Moon
} from 'lucide-react';

export default function AuthView({ onLoginSuccess, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Patient Registration form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.login(loginEmail, loginPassword);
      setStoredToken(res.data.token);
      onLoginSuccess(res.data.user, res.data.token);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'PATIENT',
        phone: phone.trim()
      };

      const res = await api.register(payload);
      setStoredToken(res.data.token);
      setSuccessMsg('Registration successful! Redirecting to your patient dashboard...');

      setTimeout(() => {
        onLoginSuccess(res.data.user, res.data.token);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Top bar with theme toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="auth-brand-badge" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/sehatsetu_logo.png" alt="SehatSetu Logo" style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'contain' }} />
            <span>SehatSetu • Bridge to Health</span>
          </div>
          {onToggleTheme && (
            <button 
              type="button"
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              style={{ width: '34px', height: '34px' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Patient Account'}
          </h1>
          <p className="auth-subtitle">
            {activeTab === 'login'
              ? 'Sign in to access your SehatSetu clinical portal and appointments'
              : 'Register as a patient on SehatSetu to connect with certified doctors'}
          </p>
        </div>

        {/* 21st.dev Capsule Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <LogIn size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <UserPlus size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Register as Patient
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: 'var(--status-cancelled-bg)',
            color: 'var(--status-cancelled-text)',
            border: '1px solid var(--status-cancelled-border)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'var(--status-confirmed-bg)',
            color: 'var(--status-confirmed-text)',
            border: '1px solid var(--status-confirmed-border)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ===================== TAB 1: SIGN IN ===================== */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">
                <Mail size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  style={{ paddingRight: '42px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-shimmer"
              style={{ width: '100%', padding: '13px', marginTop: '10px' }}
              disabled={loading}
            >
              <LogIn size={16} />
              {loading ? 'Authenticating...' : 'Sign In & Open Dashboard'}
            </button>
          </form>
        )}

        {/* ===================== TAB 2: REGISTER (PATIENT ONLY) ===================== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            {/* Patient Registration Fields */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <User size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Email Address *
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Passwords */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <Lock size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Password * (min 6 chars)
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Confirm Password *
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-shimmer"
              style={{ width: '100%', padding: '13px', marginTop: '10px' }}
              disabled={loading}
            >
              <UserPlus size={16} />
              {loading ? 'Creating Patient Account...' : 'Register as Patient'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
