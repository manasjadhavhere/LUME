import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  MapPin,
  Sparkles,
  LogIn,
  UserPlus,
  Globe,
  Star,
  Heart,
  Camera,
  ShieldCheck,
  Clock,
  Headset,
  Loader2
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import './ProfilePage.css';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

// Helper to dynamically load the Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('bookings');
  const [bookingTab, setBookingTab] = useState<string>('All');
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.clientProfile?.mobileNumber || user?.phone || '',
    location: user?.clientProfile?.location || '',
    bio: user?.clientProfile?.bio || '',
    aadharNumber: user?.clientProfile?.aadharNumber || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.clientProfile?.mobileNumber || user.phone || '',
        location: user.clientProfile?.location || '',
        bio: user.clientProfile?.bio || '',
        aadharNumber: user.clientProfile?.aadharNumber || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && token && user?.role !== 'ARTIST') {
      fetchBookings();
    }
  }, [isAuthenticated, token, user]);

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

  const handlePayNow = async (booking: any) => {
    if (!user) return;
    setPayingBookingId(booking.id);
    
    try {
      const resLoad = await loadRazorpayScript();
      if (!resLoad) throw new Error('Razorpay SDK failed to load. Are you online?');

      const orderRes = await fetch(`${API_BASE}/api/payments/pay-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Failed to create order');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', 
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'LUME',
        description: `Booking Payment`,
        image: 'https://i.imgur.com/K3VqQ5n.png', 
        order_id: orderData.data.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error('Payment verification failed');
            
            // Refresh bookings
            fetchBookings();
            alert('Payment successful! Your booking is now confirmed.');
          } catch (err) {
            console.error(err);
            alert('Payment verification failed.');
          } finally {
            setPayingBookingId(null);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#e11d48',
        },
        modal: {
          ondismiss: function () {
            setPayingBookingId(null);
          }
        }
      };
      
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      alert(err.message || 'Payment initiation failed.');
      setPayingBookingId(null);
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
      
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshUser();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`${API_BASE}/api/auth/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshUser();
      } else {
        alert('Failed to upload avatar.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      id: 'settings',
      icon: <Settings size={20} />,
      label: 'Profile Settings',
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

  // While auth is being resolved from localStorage, show nothing to avoid flicker
  if (isLoading) return null;

  // Artists must never land on the client profile page — hard redirect
  if (isAuthenticated && user?.role === 'ARTIST') {
    navigate('/artist-dashboard', { replace: true });
    return null;
  }

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
      {/* Sidebar - Column 1 */}
      <div className="profile-dashboard__sidebar">
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

      {/* Main Content - Column 2 */}
      <div className="profile-dashboard__main">
        {/* Top Banner */}
        <div className="profile-dashboard__banner">
          <div className="profile-dashboard__user">
            <div className="profile-dashboard__avatar-wrapper">
              <img 
                src={profileImage} 
                alt={user?.name} 
                className="profile-dashboard__avatar-img" 
                style={{ opacity: isUploading ? 0.5 : 1, transition: 'opacity 0.2s' }}
              />
              <button 
                className="profile-dashboard__avatar-edit" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Upload new profile picture"
              >
                <Camera size={14} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleAvatarUpload}
              />
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
                <Calendar size={20} />
              </div>
              <span className="profile-dashboard__stat-value">{totalBookings}</span>
              <span className="profile-dashboard__stat-label">Bookings</span>
            </div>
            
            {user?.role === 'ARTIST' && (
              <>
                <div className="profile-dashboard__stat-divider" />
                <div className="profile-dashboard__stat">
                  <div className="profile-dashboard__stat-icon">
                    <Star size={20} />
                  </div>
                  <span className="profile-dashboard__stat-value">{totalReviews}</span>
                  <span className="profile-dashboard__stat-label">Reviews</span>
                </div>
              </>
            )}

            <div className="profile-dashboard__stat-divider" />
            <div className="profile-dashboard__stat">
              <div className="profile-dashboard__stat-icon">
                <Heart size={20} />
              </div>
              <span className="profile-dashboard__stat-value">0</span>
              <span className="profile-dashboard__stat-label">Favorites</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content pane */}
        <div className="profile-dashboard__dynamic-content">
          {activeTab === 'bookings' && (
            <div className="profile-bookings">
              <div className="profile-dashboard__header-row">
                <h2 className="profile-bookings__title">My Bookings</h2>
                <div className="profile-bookings__tabs">
                  {['All', 'Upcoming', 'Past', 'Cancelled'].map(tab => (
                    <button 
                      key={tab} 
                      className={`profile-bookings__tab ${bookingTab === tab ? 'active' : ''}`}
                      onClick={() => setBookingTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              
              {isLoadingBookings ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)' }}>
                  Loading bookings...
                </div>
              ) : bookings.length === 0 ? (
                <div className="profile-dashboard__content-box">
                  <Calendar size={64} color="var(--rose-deep)" strokeWidth={1.5} className="profile-empty-icon" />
                  <h3 className="profile-empty-title">No bookings found</h3>
                  <p className="profile-empty-subtitle">You don't have any past or upcoming bookings yet.</p>
                  <button className="profile-empty-btn" onClick={() => navigate('/')}>Explore Services</button>
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
                    
                    const isPending = booking.status === 'PENDING';
                    const isAccepted = booking.status === 'ACCEPTED';
                    const isConfirmed = booking.status === 'CONFIRMED';
                    
                    let displayStatus = booking.status;
                    if (isPending) displayStatus = 'Request sent';
                    if (isAccepted) displayStatus = 'Pending Payment';
                    if (isConfirmed) displayStatus = 'Booking Done';

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
                        <div className="profile-booking-card__actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <div className={`profile-booking-card__status status--${booking.status.toLowerCase()}`}>
                            {displayStatus}
                          </div>
                          
                          {isAccepted && user?.role === 'CLIENT' && (
                            <button 
                              onClick={() => handlePayNow(booking)}
                              disabled={payingBookingId === booking.id}
                              style={{ padding: '6px 16px', background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              {payingBookingId === booking.id ? <Loader2 size={14} className="spinner" /> : null}
                              Pay Now (₹{booking.totalPaid})
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {activeTab === 'settings' && (
            <div className="profile-settings" style={{ padding: '0' }}>
              <div className="profile-bookings__header" style={{ marginBottom: 32 }}>
                <h2 className="profile-bookings__title" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Account Settings</h2>
                <p style={{ color: 'var(--text-soft)', marginTop: 8, fontSize: '0.95rem' }}>Update your personal information and preferences securely.</p>
              </div>
              <form onSubmit={handleSaveSettings} className="profile-settings__form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                
                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(42,26,31,0.1)', outline: 'none', fontSize: '1rem', transition: 'all 0.2s', background: 'var(--light)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--rose-deep)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(42,26,31,0.1)'}
                  />
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    maxLength={10}
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(42,26,31,0.1)', outline: 'none', fontSize: '1rem', transition: 'all 0.2s', background: 'var(--light)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--rose-deep)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(42,26,31,0.1)'}
                  />
                </div>

                {/* DOB */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Birth</label>
                  <input 
                    type="date" 
                    required
                    value={formData.dob}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(42,26,31,0.1)', outline: 'none', fontSize: '1rem', transition: 'all 0.2s', background: 'var(--light)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--rose-deep)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(42,26,31,0.1)'}
                  />
                </div>

                {/* Aadhar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aadhar Number</label>
                  <input 
                    type="text"
                    required
                    maxLength={12}
                    pattern="\d{12}"
                    title="Please enter exactly 12 digits"
                    placeholder="0000 0000 0000"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, '') })}
                    style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(42,26,31,0.1)', outline: 'none', fontSize: '1rem', transition: 'all 0.2s', background: 'var(--light)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--rose-deep)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(42,26,31,0.1)'}
                  />
                </div>

                {/* Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(42,26,31,0.1)', outline: 'none', fontSize: '1rem', transition: 'all 0.2s', background: 'var(--light)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--rose-deep)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(42,26,31,0.1)'}
                  />
                </div>

                {/* Bio */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio / About</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(42,26,31,0.1)', outline: 'none', fontSize: '1rem', resize: 'vertical', transition: 'all 0.2s', background: 'var(--light)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--rose-deep)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(42,26,31,0.1)'}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: 16 }}>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: 12,
                      background: 'var(--rose-deep)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1rem',
                      border: 'none',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.7 : 1,
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(217, 122, 140, 0.25)'
                    }}
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  {saveSuccess && (
                    <div style={{ padding: 16, background: '#dcfce7', color: '#166534', borderRadius: 12, marginTop: 16, textAlign: 'center', fontSize: '0.95rem', fontWeight: 500 }}>
                      Settings saved successfully!
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}
          
          {activeTab === 'help' && (
            <div className="profile-dashboard__content-box">
              <h3 className="profile-empty-title">Help & Support</h3>
              <p className="profile-empty-subtitle">Contact our support team for any issues or queries.</p>
            </div>
          )}

          <div className="profile-features-grid">
            <div className="profile-feature-card">
              <div className="profile-feature-card__icon profile-feature-card__icon--shield">
                <ShieldCheck size={24} />
              </div>
              <div className="profile-feature-card__text">
                <span className="profile-feature-card__title">Secure & Private</span>
                <span className="profile-feature-card__desc">Your data is encrypted and completely secure.</span>
              </div>
            </div>
            <div className="profile-feature-card">
              <div className="profile-feature-card__icon profile-feature-card__icon--clock">
                <Clock size={24} />
              </div>
              <div className="profile-feature-card__text">
                <span className="profile-feature-card__title">Easy Booking</span>
                <span className="profile-feature-card__desc">Book and manage appointments seamlessly.</span>
              </div>
            </div>
            <div className="profile-feature-card">
              <div className="profile-feature-card__icon profile-feature-card__icon--support">
                <Headset size={24} />
              </div>
              <div className="profile-feature-card__text">
                <span className="profile-feature-card__title">24/7 Support</span>
                <span className="profile-feature-card__desc">We're here to help you anytime, anywhere.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;