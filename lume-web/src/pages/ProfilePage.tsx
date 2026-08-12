import React, { useState, useEffect } from 'react';
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
  LogIn,
  UserPlus,
  Globe,
  Star,
  Heart,
  Camera
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import './ProfilePage.css';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('bookings');
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  
  // Settings Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.clientProfile?.location || '',
    bio: user?.clientProfile?.bio || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.clientProfile?.location || '',
        bio: user.clientProfile?.bio || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && token) {
      if (user?.role === 'ARTIST') {
        navigate('/artist-dashboard');
        return;
      }
      fetchBookings();
    }
  }, [isAuthenticated, token, user, navigate]);

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await res.json();
        await refreshUser();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'bookings',
      icon: <Calendar size={20} />,
      label: 'My Bookings',
    },
    {
      id: 'payments',
      icon: <CreditCard size={20} />,
      label: 'Payment Methods',
    },
    {
      id: 'settings',
      icon: <Settings size={20} />,
      label: 'Settings',
    },
    {
      id: 'help',
      icon: <HelpCircle size={20} />,
      label: 'Help & Support',
    },
    {
      id: 'logout',
      icon: <LogOut size={20} />,
      label: 'Logout',
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="profile-page--unauth">
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

  // Profile Data mapping
  const profileImage = user?.avatarUrl || user?.artistProfile?.profileImageUrl || 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=400&q=80';
  const location = user?.artistProfile?.location || user?.clientProfile?.location || 'Location not set';
  const bio = user?.artistProfile?.bio || user?.clientProfile?.bio || 'No bio provided.';
  
  // Stats mapping
  const totalBookings = user?.role === 'ARTIST' ? (user?.artistProfile?.bookingCount || 0) : bookings.length;
  const totalReviews = user?.role === 'ARTIST' ? (user?.artistProfile?.reviewCount || 0) : 0;
  
  // Format Date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="profile-dashboard">
      {/* Top Banner */}
      <div className="profile-dashboard__banner">
        <div className="profile-dashboard__user">
          <div className="profile-dashboard__avatar-wrapper">
            <img 
              src={profileImage} 
              alt={user?.name} 
              className="profile-dashboard__avatar-img" 
            />
            <button className="profile-dashboard__avatar-edit">
              <Camera size={14} />
            </button>
          </div>
          
          <div className="profile-dashboard__user-details">
            <h1 className="profile-dashboard__name">{user?.name}</h1>
            <div className="profile-dashboard__location">
              <MapPin size={16} />
              <span>{location}</span>
            </div>
            <p className="profile-dashboard__bio">
              "{bio}"
            </p>
            <div className="profile-dashboard__social">
              {user?.artistProfile?.instagramUrl && (
                <a href={user.artistProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="profile-dashboard__social-icon"><Camera size={18} /></a>
              )}
              {user?.artistProfile?.portfolioUrls && user.artistProfile.portfolioUrls.length > 0 && (
                <a href={user.artistProfile.portfolioUrls[0]} target="_blank" rel="noopener noreferrer" className="profile-dashboard__social-icon"><Globe size={18} /></a>
              )}
            </div>
          </div>
        </div>

        <div className="profile-dashboard__stats-card">
          <div className="profile-dashboard__stat">
            <div className="profile-dashboard__stat-icon">
              <Calendar size={18} />
            </div>
            <span className="profile-dashboard__stat-value">{totalBookings}</span>
            <span className="profile-dashboard__stat-label">Bookings</span>
          </div>
          
          {user?.role === 'ARTIST' && (
            <>
              <div className="profile-dashboard__stat-divider" />
              <div className="profile-dashboard__stat">
                <div className="profile-dashboard__stat-icon profile-dashboard__stat-icon--red">
                  <Star size={18} />
                </div>
                <span className="profile-dashboard__stat-value">{totalReviews}</span>
                <span className="profile-dashboard__stat-label">Reviews</span>
              </div>
            </>
          )}

          <div className="profile-dashboard__stat-divider" />
          <div className="profile-dashboard__stat">
            <div className="profile-dashboard__stat-icon profile-dashboard__stat-icon--heart">
              <Heart size={18} />
            </div>
            <span className="profile-dashboard__stat-value">0</span>
            <span className="profile-dashboard__stat-label">Favorites</span>
          </div>
        </div>
      </div>

      {/* Artist Portal Switcher Banner has been removed since Artists are redirected to /artist-dashboard */}

      {/* Main Content Area */}
      <div className="profile-dashboard__content">
        
        {/* Sidebar */}
        <div className="profile-dashboard__sidebar">
          <h2 className="profile-dashboard__sidebar-title">ACCOUNT</h2>
          <div className="profile-dashboard__menu">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const isLogout = item.id === 'logout';
              
              return (
                <button
                  key={item.id}
                  className={`profile-dashboard__menu-item ${isActive ? 'active' : ''} ${isLogout ? 'logout' : ''}`}
                  onClick={() => {
                    if (isLogout) {
                      handleLogout();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                >
                  <span className="profile-dashboard__menu-icon">{item.icon}</span>
                  <span className="profile-dashboard__menu-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content pane */}
        <div className="profile-dashboard__main">
          {activeTab === 'bookings' && (
            <div className="profile-bookings">
              <div className="profile-bookings__header">
                <h2 className="profile-bookings__title">My Bookings</h2>
              </div>
              
              {isLoadingBookings ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)' }}>
                  Loading bookings...
                </div>
              ) : bookings.length === 0 ? (
                <div className="profile-dashboard__placeholder">
                  <h3>No bookings found</h3>
                  <p>You don't have any past or upcoming bookings yet.</p>
                </div>
              ) : (
                <div className="profile-bookings__list">
                  {bookings.map((booking: any) => {
                    const title = booking.service?.name || 'Custom Booking';
                    // If client, show artist avatar. If artist, show client avatar.
                    const image = user?.role === 'CLIENT' 
                      ? booking.artist?.user?.avatarUrl 
                      : booking.client?.avatarUrl;
                    const displayImage = image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80';
                    const displayLocation = booking.address || 'Location not set';
                    
                    return (
                      <div key={booking.id} className="profile-booking-card">
                        <img src={displayImage} alt={title} className="profile-booking-card__image" />
                        <div className="profile-booking-card__details">
                          <h3 className="profile-booking-card__title">{title}</h3>
                          <div className="profile-booking-card__time">
                            {formatDate(booking.date)} • {booking.time}
                          </div>
                          <div className="profile-booking-card__location">
                            <MapPin size={14} />
                            <span>{displayLocation}</span>
                          </div>
                        </div>
                        <div className="profile-booking-card__actions">
                          <div className={`profile-booking-card__status status--${booking.status.toLowerCase()}`}>
                            {booking.status}
                          </div>
                          <ChevronRight size={18} className="profile-booking-card__arrow" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="profile-dashboard__placeholder">
              <h3>Payment Methods</h3>
              <p>Manage your saved cards and payment preferences here.</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="profile-settings">
              <div className="profile-bookings__header">
                <h2 className="profile-bookings__title">Account Settings</h2>
              </div>
              <form onSubmit={handleSaveSettings} className="profile-settings__form" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark)' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark)' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark)' }}>Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark)' }}>Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  style={{
                    marginTop: 8,
                    padding: '14px',
                    borderRadius: 8,
                    background: 'var(--rose-deep)',
                    color: 'white',
                    fontWeight: 600,
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                {saveSuccess && (
                  <div style={{ padding: 12, background: '#dcfce7', color: '#166534', borderRadius: 8, marginTop: 8, textAlign: 'center', fontSize: '0.9rem' }}>
                    Settings saved successfully!
                  </div>
                )}
              </form>
            </div>
          )}
          
          {activeTab === 'help' && (
            <div className="profile-dashboard__placeholder">
              <h3>Help & Support</h3>
              <p>Contact our support team for any issues or queries.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;