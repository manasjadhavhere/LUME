import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  User,
  Calendar,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  CheckCircle2,
} from 'lucide-react';
} from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import './ArtistDashboardLayout.css';

const navItems = [
  { to: '/artist-dashboard', end: true, icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { to: '/artist-dashboard/profile', icon: <User size={18} />, label: 'Profile & Services' },
  { to: '/artist-dashboard/calendar', icon: <Calendar size={18} />, label: 'Calendar & Slots' },
  { to: '/artist-dashboard/ratings', icon: <Star size={18} />, label: 'Reviews & Analytics' },
];

const ArtistDashboardLayout: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { execute } = useApi();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await execute('/api/notifications');
        if (res && res.data) {
          setNotifications(res.data);
        }
      } catch (e) { console.error('Failed to fetch notifications', e); }
    };
    if (user) fetchNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user, execute]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await execute('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const currentNav = navItems.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  );

  return (
    <div className="artist-layout">
      {/* ── Subtle Dashboard Background ── */}
      <div className="artist-ambient-bg" aria-hidden="true" />

      {/* Mobile Overlay */}
      <div
        className={`artist-sidebar__overlay ${sidebarOpen ? 'artist-sidebar__overlay--visible' : ''}`}
        onClick={closeSidebar}
      />

      {/* ── Warm Editorial Luxury Ivory Glass Sidebar ── */}
      <aside className={`artist-sidebar ${sidebarOpen ? 'artist-sidebar--open' : ''}`}>
        {/* Brand Header */}
        <div className="artist-sidebar__header">
          <Link to="/" className="artist-sidebar__logo" onClick={closeSidebar}>
            <Sparkles size={20} className="artist-sidebar__logo-icon" />
            <span>LUME</span>
          </Link>
          <span className="artist-sidebar__logo-badge">Artist Studio</span>
        </div>

        {/* Artist Identification Card */}
        <div className="artist-sidebar__profile">
          <div className="artist-sidebar__profile-avatar">
            {(user?.name || 'Artist').charAt(0).toUpperCase()}
            <div className="artist-sidebar__profile-dot" title="Live & Taking Bookings" />
          </div>
          <div className="artist-sidebar__profile-info">
            <div className="artist-sidebar__profile-name">{user?.name || 'Artist'}</div>
            <div className="artist-sidebar__profile-status">
              <CheckCircle2 size={13} color="#d97a8c" /> Verified Studio
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="artist-sidebar__nav">
          <div className="artist-sidebar__nav-section">Studio Workspace</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `artist-sidebar__link ${isActive ? 'artist-sidebar__link--active' : ''}`
              }
              onClick={closeSidebar}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="artist-sidebar__nav-section">Preferences</div>
          <NavLink
            to="/artist-dashboard/profile"
            className={({ isActive }) =>
              `artist-sidebar__link ${isActive && location.pathname.includes('settings') ? 'artist-sidebar__link--active' : ''}`
            }
            onClick={closeSidebar}
          >
            <Settings size={18} />
            <span>Studio Settings</span>
          </NavLink>
        </nav>

        {/* Footer Actions */}
        <div className="artist-sidebar__footer">
          <Link to="/home" className="artist-sidebar__action-btn" onClick={closeSidebar}>
            <ExternalLink size={16} />
            <span>View Client Portal</span>
          </Link>
          <button className="artist-sidebar__action-btn artist-sidebar__action-btn--logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <main className="artist-main">
        {/* Liquid Frosted Glass Topbar */}
        <header className="artist-topbar">
          <div className="artist-topbar__left">
            <button
              type="button"
              className="artist-sidebar__toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="artist-topbar__title">
              {currentNav?.label || 'Studio Overview'}
            </span>
            <div className="artist-topbar__status-pill">
              <span className="artist-topbar__status-dot" />
              <span>Taking Bookings</span>
            </div>
          </div>

          <div className="artist-topbar__right">
            <Link to="/discover" className="artist-topbar__client-btn">
              <span>View Directory</span>
              <ExternalLink size={13} />
            </Link>
            
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                type="button" 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={18} color="var(--text-soft)" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 5px', borderRadius: 10, fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 12, width: 320, background: 'white', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(42,26,31,0.05)', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(42,26,31,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--dark)' }}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button type="button" onClick={markAllAsRead} style={{ fontSize: '0.8rem', color: 'var(--rose-deep)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all as read</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.9rem' }}>No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(42,26,31,0.03)', background: n.isRead ? 'white' : 'rgba(217,122,140,0.04)' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)', marginBottom: 4 }}>{n.title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: 8 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default ArtistDashboardLayout;
