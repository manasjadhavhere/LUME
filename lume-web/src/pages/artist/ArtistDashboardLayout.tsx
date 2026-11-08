import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Calendar,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/layout/NotificationBell';
import { apiFetch } from '../../hooks/useApi';
import './ArtistDashboardLayout.css';

const navItems = [
  { to: '/artist-dashboard', end: true, icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { to: '/artist-dashboard/profile', icon: <User size={18} />, label: 'Profile & Services' },
  { to: '/artist-dashboard/calendar', icon: <Calendar size={18} />, label: 'Calendar & Slots' },
  { to: '/artist-dashboard/ratings', icon: <Star size={18} />, label: 'Reviews & Analytics' },
];

const ArtistDashboardLayout: React.FC = () => {
  const { user, logout, updateUser, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const currentNav = [
    ...navItems,
    { to: '/artist-dashboard/bookings', label: 'Booking Requests' },
    { to: '/artist-dashboard/settings', label: 'Studio Settings' },
  ].find((n) =>
    (n as any).end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  );

  const [isTakingBookings, setIsTakingBookings] = useState(
    user?.artistProfile?.isTakingBookings ?? true
  );
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (user?.artistProfile) {
      setIsTakingBookings(user.artistProfile.isTakingBookings ?? true);
    }
  }, [user]);

  const toggleBookingStatus = async () => {
    if (statusUpdating) return;
    setStatusUpdating(true);
    try {
      const res = await apiFetch('/api/artists/me/booking-status', {
        method: 'PATCH',
        body: { isTakingBookings: !isTakingBookings },
        token: token || undefined
      });
      if (res) {
        setIsTakingBookings(!isTakingBookings);
        if (user && user.artistProfile) {
          updateUser({
            artistProfile: {
              ...user.artistProfile,
              isTakingBookings: !isTakingBookings
            }
          });
        }
        alert('Booking status updated successfully.');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update booking status.');
    } finally {
      setStatusUpdating(false);
    }
  };

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
          <Link to="/" className="artist-sidebar__logo" onClick={closeSidebar} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Lume Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <span className="artist-sidebar__logo-badge">Artist Studio</span>
        </div>

        {/* Artist Identification Card */}
        <div className="artist-sidebar__profile">
          <div className="artist-sidebar__profile-avatar">
            {(user?.name || 'Artist').charAt(0).toUpperCase()}
            <div 
              className="artist-sidebar__profile-dot" 
              title={isTakingBookings ? "Live & Taking Bookings" : "Not Taking Bookings"}
              style={{ background: isTakingBookings ? '#10b981' : '#ef4444' }}
            />
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

          <div className="artist-sidebar__nav-section">Bookings & Settings</div>
          <NavLink 
            to="/artist-dashboard/bookings" 
            end 
            className={({ isActive }) => `artist-sidebar__link ${isActive ? 'artist-sidebar__link--active' : ''}`}
            onClick={closeSidebar}
          >
            <Clock size={18} />
            <span>Booking Requests</span>
          </NavLink>

          <NavLink
            to="/artist-dashboard/settings"
            className={({ isActive }) =>
              `artist-sidebar__link ${isActive ? 'artist-sidebar__link--active' : ''}`
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
            <div className="artist-topbar__booking-status" title="Toggle to turn bookings on/off. (48-hour lock applies)">
              <button 
                type="button"
                onClick={toggleBookingStatus}
                disabled={statusUpdating}
                className={`artist-topbar__toggle-switch ${isTakingBookings ? 'artist-topbar__toggle-switch--on' : ''}`}
                aria-label={isTakingBookings ? 'Turn off bookings' : 'Turn on bookings'}
              >
                <div className={`artist-topbar__toggle-knob ${isTakingBookings ? 'artist-topbar__toggle-knob--on' : ''}`} />
              </button>
              <span className={`artist-topbar__booking-label ${isTakingBookings ? 'artist-topbar__booking-label--on' : ''}`}>
                {isTakingBookings ? 'Taking Bookings' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="artist-topbar__right">
            <Link to="/discover" className="artist-topbar__client-btn" title="View Public Directory">
              <span className="artist-topbar__client-btn-text">View Directory</span>
              <ExternalLink size={14} />
            </Link>
            
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default ArtistDashboardLayout;
