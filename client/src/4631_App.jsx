import React, { useState, useEffect } from 'react';
import { api, setStoredToken, getStoredToken } from './services/4631_api';
import AuthView from './views/4631_AuthView';
import PatientView from './views/4631_PatientView';
import DoctorView from './views/4631_DoctorView';
import AdminView from './views/4631_AdminView';
import NotificationDropdown from './components/4631_NotificationDropdown';
import { 
  Activity, 
  Bell, 
  LogOut, 
  Sun, 
  Moon, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Stethoscope, 
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sehatsetu_theme') || localStorage.getItem('care_sync_theme') || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sehatsetu_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Initialize authentication on load
  useEffect(() => {
    initAuth();
  }, []);

  // Poll unread notification count periodically for logged-in user
  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const initAuth = async () => {
    const token = getStoredToken();
    if (token) {
      try {
        const res = await api.getMe();
        setCurrentUser(res.data.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        setStoredToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.getUnreadCount();
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Silent catch on poll
    }
  };

  const handleLoginSuccess = (user, token) => {
    setStoredToken(token);
    setCurrentUser(user);
    fetchUnreadCount();
  };

  const handleLogout = () => {
    setStoredToken(null);
    setCurrentUser(null);
    setShowNotifications(false);
  };

  // Loading Splash Screen (21st.dev Style)
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg-main)',
        color: 'var(--text-main)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 20px',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(1, 136, 96, 0.4)',
            animation: 'pulse-glow 1.5s infinite',
            background: '#ffffff',
            padding: '4px'
          }}>
            <img src="/sehatsetu_logo.png" alt="SehatSetu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Sehat<span style={{ color: 'var(--emerald-400)' }}>Setu</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Bridge to Health • Initializing secure session & clinical privileges...
          </p>
        </div>
      </div>
    );
  }

  // 1. If unauthenticated, present the full Login & Registration Page
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} theme={theme} onToggleTheme={toggleTheme} />;
  }

  // 2. Role-specific Dashboard logic
  const role = currentUser.role;

  return (
    <div className="app-container">
      {/* 21st.dev Modern Frosted Navbar */}
      <nav className="main-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-icon">
              <img src="/sehatsetu_logo.png" alt="SehatSetu Logo" />
            </div>
            <div className="brand-name">
              Sehat<span>Setu</span>
            </div>
          </div>

          {/* Active Portal Indicator Badge */}
          {role === 'PATIENT' && (
            <span className="role-dashboard-badge badge-patient">
              <User size={13} style={{ marginRight: '2px' }} /> Patient Portal
            </span>
          )}
          {role === 'DOCTOR' && (
            <span className="role-dashboard-badge badge-doctor">
              <Stethoscope size={13} style={{ marginRight: '2px' }} /> Doctor Portal
            </span>
          )}
          {role === 'ADMIN' && (
            <span className="role-dashboard-badge badge-admin">
              <ShieldAlert size={13} style={{ marginRight: '2px' }} /> Admin Control Center
            </span>
          )}
        </div>

        <div className="nav-actions">
          {/* 21st.dev Theme Switcher Toggle */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="notification-bell-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) setUnreadCount(0);
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="bell-badge">{unreadCount}</span>
              )}
            </button>
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* User Badge */}
          <div className="user-badge">
            <div className="user-avatar">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role-tag">{role}</span>
            </div>
          </div>

          {/* Dedicated Sign Out Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Sign out of system"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Hero Banner (Shown for Patient portal) */}
      {role === 'PATIENT' && (
        <section className="hero-banner">
          <div className="hero-tag">
            <Sparkles size={14} color="var(--primary-400)" />
            <span>Bridge to Health • Next-Generation Scheduling</span>
            <span style={{ color: 'var(--text-light)', margin: '0 4px' }}>•</span>
            <span style={{ color: 'var(--primary-400)', fontWeight: 700 }}>Zero Double-Booking</span>
            <ArrowRight size={13} style={{ marginLeft: '4px' }} />
          </div>
          <h1 className="hero-title">
            Book Certified Specialists with <span>Guaranteed Slots</span>
          </h1>
          <p className="hero-subtitle">
            Seamless real-time appointment booking, atomic slot claiming, verified medical doctors, and instant automated updates.
          </p>
        </section>
      )}

      {/* Main Content Area: STRICT ROLE-SPECIFIC DASHBOARDS */}
      <main className="content-wrapper">
        {role === 'PATIENT' && <PatientView currentUser={currentUser} />}
        {role === 'DOCTOR' && <DoctorView currentUser={currentUser} onUserUpdate={setCurrentUser} />}
        {role === 'ADMIN' && <AdminView currentUser={currentUser} />}
      </main>
    </div>
  );
}
