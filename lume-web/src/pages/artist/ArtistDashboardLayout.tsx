import React, { useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import './ArtistDashboardLayout.css';

const navItems = [
  { to: '/artist-dashboard', end: true, icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { to: '/artist-dashboard/profile', icon: <User size={18} />, label: 'Profile & Services' },
  { to: '/artist-dashboard/calendar', icon: <Calendar size={18} />, label: 'Calendar & Slots' },
  { to: '/artist-dashboard/ratings', icon: <Star size={18} />, label: 'Reviews & Analytics' },
];

const ArtistDashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* ── Ambient Liquid Glass Glow Spheres ── */}
      <div className="artist-ambient-bg" aria-hidden="true">
        <div className="artist-ambient-orb artist-ambient-orb--1" />
        <div className="artist-ambient-orb artist-ambient-orb--2" />
      </div>

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
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            <div className="artist-sidebar__profile-dot" title="Live & Taking Bookings" />
          </div>
          <div className="artist-sidebar__profile-info">
            <div className="artist-sidebar__profile-name">{user?.name || 'Aria Mehra'}</div>
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
            <Bell size={18} color="var(--text-soft)" style={{ cursor: 'pointer' }} />
          </div>
        </header>

        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default ArtistDashboardLayout;
