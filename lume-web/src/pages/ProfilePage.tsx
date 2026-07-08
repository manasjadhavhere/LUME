import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  MapPin,
  ChevronRight,
  Sparkles,
  Palette,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleMenuItemClick = (itemId: string) => {
    switch (itemId) {
      case 'bookings':
        alert('My Bookings — You can view your upcoming bookings here!');
        break;
      case 'payments':
        alert('Payment Methods — Managed securely via Stripe / UPI.');
        break;
      case 'settings':
        alert('Settings — Account preferences.');
        break;
      case 'help':
        alert('Help & Support — Contact team@lume.in for 24/7 support.');
        break;
      case 'logout':
        if (window.confirm('Are you sure you want to logout?')) {
          logout();
          navigate('/');
        }
        break;
      default:
        break;
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'bookings',
      icon: <Calendar size={20} />,
      label: 'My Bookings',
      onClick: () => handleMenuItemClick('bookings'),
    },
    {
      id: 'payments',
      icon: <CreditCard size={20} />,
      label: 'Payment Methods',
      onClick: () => handleMenuItemClick('payments'),
    },
    {
      id: 'settings',
      icon: <Settings size={20} />,
      label: 'Settings',
      onClick: () => handleMenuItemClick('settings'),
    },
    {
      id: 'help',
      icon: <HelpCircle size={20} />,
      label: 'Help & Support',
      onClick: () => handleMenuItemClick('help'),
    },
    {
      id: 'logout',
      icon: <LogOut size={20} />,
      label: 'Logout',
      onClick: () => handleMenuItemClick('logout'),
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="profile-page" style={{ padding: '48px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--rose-light)', color: 'var(--rose-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Sparkles size={28} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 8, color: 'var(--dark)' }}>
          Sign in to Lume
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: 24 }}>
          Access your bookings, favorite makeup artists, and account settings.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--rose-deep)',
              color: 'white',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <LogIn size={18} /> Sign In
          </Link>
          <Link
            to="/register"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              color: 'var(--dark)',
              border: '1.5px solid rgba(42,26,31,0.15)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <UserPlus size={18} /> Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-page__header">
        <div className="profile-page__user-info">
          <div className="profile-page__avatar">
            <span className="profile-page__avatar-emoji">👩‍🦱</span>
          </div>
          <div className="profile-page__user-details">
            <h1 className="profile-page__name">{user?.name || 'Priya Sharma'}</h1>
            <div className="profile-page__location">
              <MapPin size={16} />
              <span>{user?.clientProfile?.location || 'Mumbai, India'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Portal Switcher Banner (if user is Artist or wants to switch) */}
      {user?.role === 'ARTIST' ? (
        <div
          style={{
            margin: '0 20px 20px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--dark), #402931)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(42,26,31,0.15)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              Artist Mode Active ✨
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
              Manage your bookings, availability, and portfolio
            </div>
          </div>
          <button
            onClick={() => navigate('/artist-dashboard')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--gold)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Palette size={14} /> Open Dashboard
          </button>
        </div>
      ) : null}

      {/* Profile Stats */}
      <div className="profile-page__stats">
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">12</span>
          <span className="profile-page__stat-label">Bookings</span>
        </div>
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">8</span>
          <span className="profile-page__stat-label">Reviews</span>
        </div>
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">3</span>
          <span className="profile-page__stat-label">Favorites</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="profile-page__menu">
        <h2 className="profile-page__menu-title">Account</h2>
        <div className="profile-page__menu-list">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              className={`profile-page__menu-item ${
                item.id === 'logout' ? 'profile-page__menu-item--danger' : ''
              }`}
              onClick={item.onClick}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="profile-page__menu-item-content">
                <div className="profile-page__menu-item-left">
                  <span className="profile-page__menu-item-icon">{item.icon}</span>
                  <span className="profile-page__menu-item-label">{item.label}</span>
                </div>
                <ChevronRight size={16} className="profile-page__menu-item-arrow" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="profile-page__app-info">
        <p className="profile-page__app-version">Lume v1.0.0</p>
        <p className="profile-page__app-tagline">Your canvas. Our masterpiece.</p>
      </div>
    </div>
  );
};

export default ProfilePage;