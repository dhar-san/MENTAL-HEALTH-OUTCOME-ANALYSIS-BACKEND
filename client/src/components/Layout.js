/**
 * Layout - Premium glass sidebar + top bar
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    if (showProfile) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfile]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.notifications || []);
      } catch (e) {}
    };
    fetch();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const pageTitle = location.pathname.startsWith('/admin/assessments') ? 'Assessments'
    : location.pathname === '/admin' ? 'Admin'
    : location.pathname === '/dashboard' ? 'Dashboard'
    : location.pathname === '/motivation' ? 'Motivation & Recovery'
    : /^\/assessments\/[^/]+$/.test(location.pathname) ? 'Take Assessment'
    : location.pathname === '/assessments' ? 'My Assessments'
    : 'Analytics';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-glow" />
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span className="brand-icon">◉</span>
          </div>
          <span className="brand-text">MindFlow</span>
        </div>
        <nav className="sidebar-nav">
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin" className={isActive('/admin') && !location.pathname.includes('/assessments') ? 'active' : ''}>
                <span className="nav-dot" />
                <span className="nav-label">Dashboard</span>
              </Link>
              <Link to="/admin/assessments" className={isActive('/admin/assessments') ? 'active' : ''}>
                <span className="nav-dot" />
                <span className="nav-label">Assessments</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                <span className="nav-dot" />
                <span className="nav-label">Dashboard</span>
              </Link>
              <Link to="/assessments" className={isActive('/assessments') ? 'active' : ''}>
                <span className="nav-dot" />
                <span className="nav-label">My Assessments</span>
              </Link>
              <Link to="/motivation" className={isActive('/motivation') ? 'active' : ''}>
                <span className="nav-dot" />
                <span className="nav-label">Motivation</span>
              </Link>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="nav-dot" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">{pageTitle}</h1>
          </div>
          <div className="topbar-right">
            <div className="notif-wrap">
              <button className="topbar-btn notif-btn" onClick={() => setShowNotif(!showNotif)} title="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              {showNotif && (
                <div className="notif-dropdown">
                  {notifications.length === 0 ? (
                    <p className="notif-empty">No notifications</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`}>{n.message}</div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="user-pill-wrap" ref={profileRef}>
              <button
                className="user-pill"
                onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
                title="Profile"
              >
                <div className="user-avatar" style={{ background: 'var(--gradient-aurora)' }}>{user?.name?.charAt(0) || '?'}</div>
                <span className="user-name">{user?.name}</span>
              </button>
              {showProfile && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="user-avatar" style={{ background: 'var(--gradient-aurora)' }}>{user?.name?.charAt(0) || '?'}</div>
                    <div>
                      <div className="profile-name">{user?.name}</div>
                      <div className="profile-email">{user?.email}</div>
                    </div>
                  </div>
                  <button className="profile-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
