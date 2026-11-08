import { useScrollLock } from '../hooks/useScrollLock';
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
  Star,
  Heart,
  Camera,
  ShieldCheck,
  Clock,
  Headset,
  Loader2,
  Building2,
  Home,
  Plus,
  Trash2,
  Edit3,
  Receipt,
  Printer,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  X,
  CreditCard,
  Mail,
  CheckCircle2,
  Palette
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import useFavorites from '../hooks/useFavorites';
import GeoLocationInput from '../components/ui/GeoLocationInput';
import PaymentOptionsModal from '../components/payment/PaymentOptionsModal';
import PhoneInput from '../components/ui/PhoneInput';
import ReviewModal from '../components/review/ReviewModal';
import BookingLocationModal from '../components/booking/BookingLocationModal';
import type { ClientSavedAddress as SavedAddress } from '../context/AuthContext';
import { useSaveClientProfile } from '../hooks/useSaveClientProfile';
import { hasBookingDateTimePassed, isBookingReviewEligible } from '../utils/bookingTime';
import { getArtistSlug } from '../utils/slug';
import './ProfilePage.css';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
}

export interface BeautyPreferences {
  styles: string[];
  skinType: string;
  undertone: string;
  specialRequests: string;
}

const DEFAULT_PREFERENCES: BeautyPreferences = {
  styles: [],
  skinType: '',
  undertone: '',
  specialRequests: '',
};

const STYLE_OPTIONS = [
  'Bridal Artistry',
  'Reception Glam',
  'Sangeet & Mehendi',
  'Soft Glam / Minimalist',
  'Airbrush HD Makeup',
  'Editorial / High Fashion',
  'Hair Sculpting & Updos',
  'Saree & Dupatta Draping',
];

const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
const UNDERTONES = ['Warm Golden', 'Cool Rose', 'Neutral', 'Olive', 'Deep Rich'];

const FAQS = [
  {
    q: 'How does the 25% Advance vs Remaining balance payment work?',
    a: 'When an artist accepts your booking request, you can secure your appointment date by paying a 25% advance (or the full amount) online. The remaining balance is only payable once your appointment is confirmed or on the appointment day.',
  },
  {
    q: 'Is my payment protected in escrow?',
    a: 'Yes, 100%. LUME holds all client payments safely in a verified Razorpay escrow account. Funds are only settled to the beauty artist after your appointment has been delivered satisfactorily.',
  },
  {
    q: 'Can I reschedule or cancel my booking?',
    a: 'Yes. You can coordinate rescheduling directly with your artist via your booking details. In the rare event an artist is unavailable, LUME provides instant full refunds or priority matching with a top-rated alternate artist.',
  },
  {
    q: 'How do bridal trial sessions work?',
    a: 'Bridal trials can be booked as an individual service or added to your bridal package. Your artist will assess your skin, review your bridal outfits, and test your customized makeup and hair look in advance.',
  },
  {
    q: 'Where do I find my booking invoice and receipt?',
    a: 'You can view, print, or download an itemized GST tax invoice for any accepted, partially paid, or confirmed booking by clicking "View Receipt / Invoice" on the booking card.',
  },
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const { getFavorites, toggleFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState<string>('bookings');
  const [bookingTab, setBookingTab] = useState<string>('All');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any | null>(null);
  const [payingRemainingId, setPayingRemainingId] = useState<string | null>(null);

  // Invoice modal state
  const [invoiceBooking, setInvoiceBooking] = useState<any | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  
  useScrollLock(Boolean(invoiceBooking));

  // Saved Artists state
  const [savedArtists, setSavedArtists] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Saved Addresses state
  const saveProfile = useSaveClientProfile();
  const addresses = user?.clientProfile?.savedAddresses ?? [];
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [profileError, setProfileError] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const [preferences, setPreferences] = useState<BeautyPreferences>(DEFAULT_PREFERENCES);
  useEffect(() => {
    setPreferences({ ...DEFAULT_PREFERENCES, ...user?.clientProfile?.beautyPreferences });
  }, [user?.id, user?.clientProfile?.beautyPreferences]);
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Profile Form state
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

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
  }, [user?.id, user?.name, user?.phone, user?.clientProfile?.mobileNumber, user?.clientProfile?.location, user?.clientProfile?.bio, user?.clientProfile?.aadharNumber, user?.dob]);

  const fetchBookings = React.useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token && user?.role !== 'ARTIST') {
      fetchBookings();
    }
  }, [isAuthenticated, token, user?.role, fetchBookings]);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Load Saved Artists when tab is active or favorites change
  useEffect(() => {
    const favoriteIds = getFavorites();
    if (favoriteIds.length === 0) {
      setSavedArtists([]);
      return;
    }
    setIsLoadingFavorites(true);
    fetch(`${API_BASE}/api/artists?limit=100`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const all: any[] = Array.isArray(data.data) ? data.data : (data.data?.artists || []);
          setSavedArtists(all.filter((a) => favoriteIds.includes(a.id)));
        }
      })
      .catch(() => setSavedArtists([]))
      .finally(() => setIsLoadingFavorites(false));
  }, [activeTab]);

  const handlePayNow = (booking: any) => {
    setSelectedBookingForPayment(booking);
    setShowPaymentModal(true);
  };

  const handlePayRemaining = async (booking: any) => {
    if (!user) return;
    setPayingRemainingId(booking.id);
    try {
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Razorpay SDK failed to load'));
          document.body.appendChild(s);
        });
      }

      const orderRes = await fetch(`${API_BASE}/api/payments/create-booking-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: booking.id, paymentType: 'REMAINING' }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Failed to create order');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'LUME',
        description: `Remaining Balance — ${booking.service?.name || 'Booking'}`,
        image: 'https://i.imgur.com/K3VqQ5n.png',
        order_id: orderData.data.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payments/verify-booking`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
                paymentType: 'REMAINING',
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error('Payment verification failed');
            fetchBookings();
          } catch (err: any) {
            alert(err.message || 'Payment verification failed.');
          } finally {
            setPayingRemainingId(null);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#d45e7e' },
        modal: { ondismiss: () => setPayingRemainingId(null) },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed.');
      setPayingRemainingId(null);
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
    const form = new FormData();
    form.append('avatar', file);

    try {
      const res = await fetch(`${API_BASE}/api/auth/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
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
    if (window.confirm('Are you sure you want to sign out of LUME?')) {
      logout();
      navigate('/');
    }
  };

  const handleOpenAddAddress = () => { setEditingAddress(null); setShowAddressModal(true); };
  const handleOpenEditAddress = (addr: SavedAddress) => { setEditingAddress(addr); setShowAddressModal(true); };
  const saveAddresses = async (savedAddresses: SavedAddress[]) => {
    setProfileError(''); setSavingDetails(true);
    try { await saveProfile({ savedAddresses }); }
    catch (error) { setProfileError(error instanceof Error ? error.message : 'Could not save address changes.'); }
    finally { setSavingDetails(false); }
  };
  const handleDeleteAddress = (id: string) => {
    if (!window.confirm('Remove this saved address?')) return;
    const next = addresses.filter(a => a.id !== id);
    if (next.length && !next.some(a => a.isDefault)) next[0] = { ...next[0], isDefault: true };
    void saveAddresses(next);
  };
  const handleSetDefaultAddress = (id: string) => void saveAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));

  // Preference Handlers
  const toggleStyle = (style: string) => {
    setPreferences((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }));
  };

  const handleSavePreferences = async () => {
    setProfileError(''); setPreferencesSaved(false); setSavingDetails(true);
    try {
      await saveProfile({ beautyPreferences: preferences });
      setPreferencesSaved(true);
      setTimeout(() => setPreferencesSaved(false), 3000);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Could not save preferences.');
    } finally { setSavingDetails(false); }
  };

  // Format Date Helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b: any) => {
    // Tab filter
    if (bookingTab === 'Upcoming') {
      if (!['PENDING', 'ACCEPTED', 'PARTIALLY_PAID', 'CONFIRMED'].includes(b.status) || hasBookingDateTimePassed(b, now)) return false;
    } else if (bookingTab === 'Action Needed') {
      if (!['ACCEPTED', 'PARTIALLY_PAID'].includes(b.status)) return false;
    } else if (bookingTab === 'Completed') {
      if (b.status !== 'COMPLETED' && !(['ACCEPTED', 'PARTIALLY_PAID', 'CONFIRMED'].includes(b.status) && hasBookingDateTimePassed(b, now))) return false;
    } else if (bookingTab === 'Cancelled') {
      if (b.status !== 'CANCELLED') return false;
    }

    // Search filter
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const artistName = (b.artist?.user?.name || '').toLowerCase();
      const serviceName = (b.service?.name || '').toLowerCase();
      const venue = (b.address || '').toLowerCase();
      return artistName.includes(q) || serviceName.includes(q) || venue.includes(q);
    }

    return true;
  });

  const favoritesCount = getFavorites().length;

  const menuItems: MenuItem[] = [
    {
      id: 'bookings',
      icon: <Calendar size={18} />,
      label: 'My Bookings',
      badge: bookings.length > 0 ? bookings.length : undefined,
    },
    {
      id: 'favorites',
      icon: <Heart size={18} />,
      label: 'Saved Artists',
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      id: 'addresses',
      icon: <Home size={18} />,
      label: 'Addresses & Venues',
      badge: addresses.length > 0 ? addresses.length : undefined,
    },
    {
      id: 'preferences',
      icon: <Palette size={18} />,
      label: 'Beauty Profile',
    },
    {
      id: 'settings',
      icon: <Settings size={18} />,
      label: 'Account Settings',
    },
    {
      id: 'help',
      icon: <HelpCircle size={18} />,
      label: 'Concierge & Help',
    },
  ];

  if (isLoading) {
    return (
      <div className="profile-loading-screen">
        <Loader2 size={36} className="spinner" />
        <p>Loading your account dashboard…</p>
      </div>
    );
  }

  // Artists belong on the Artist Dashboard
  if (isAuthenticated && user?.role === 'ARTIST') {
    navigate('/artist-dashboard', { replace: true });
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-page--unauth">
        <div className="profile-unauth-icon">
          <Sparkles size={32} />
        </div>
        <h1>Sign In to Lume</h1>
        <p>
          Access your appointment calendar, curated saved artists, saved addresses, and VIP concierge services.
        </p>
        <div className="profile-unauth-actions">
          <Link to="/login" className="profile-btn profile-btn--primary">
            <LogIn size={18} /> Sign In
          </Link>
          <Link to="/register" className="profile-btn profile-btn--secondary">
            <UserPlus size={18} /> Create Account
          </Link>
        </div>
      </div>
    );
  }

  const profileImage =
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';
  const location = user?.clientProfile?.location || 'Mumbai, India';
  const bio = user?.clientProfile?.bio || 'Beauty & Bridal Enthusiast';

  return (
    <div className="profile-dashboard">
      {/* ── Column 1: Client Sidebar ── */}
      <aside className="profile-dashboard__sidebar">
        {/* Client Identity Header Card in Sidebar */}
        <div className="profile-sidebar-user">
          <div className="profile-sidebar-user-top">
            <div className="profile-avatar-wrapper">
              <img
                src={profileImage}
                alt={user?.name}
                className="profile-avatar-img"
                style={{ opacity: isUploading ? 0.6 : 1 }}
              />
              <button
                className="profile-avatar-edit"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Upload profile picture"
                aria-label="Upload profile picture"
              >
                <Camera size={12} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="profile-user-summary">
              <div className="profile-user-title-row">
                <h2 className="profile-user-name">{user?.name}</h2>
                <span className="profile-verified-badge" title="Identity Verified">
                  <ShieldCheck size={12} /> Verified Client
                </span>
              </div>
              <div className="profile-user-meta-sub">
                <span className="profile-user-location" title={`${location} • "${bio}"`}>
                  <MapPin size={11} /> {location}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Telemetry Pills inside Sidebar */}
          <div className="profile-sidebar-telemetry">
            <button
              className={`profile-tele-mini ${activeTab === 'bookings' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('bookings')}
              title="View bookings"
            >
              <span className="profile-tele-val">{bookings.length}</span>
              <span className="profile-tele-lbl">Bookings</span>
            </button>
            <div className="profile-tele-divider" />
            <button
              className={`profile-tele-mini ${activeTab === 'favorites' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('favorites')}
              title="View saved artists"
            >
              <span className="profile-tele-val">{favoritesCount}</span>
              <span className="profile-tele-lbl">Saved Artists</span>
            </button>
            <div className="profile-tele-divider" />
            <button
              className={`profile-tele-mini ${activeTab === 'addresses' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('addresses')}
              title="View saved addresses"
            >
              <span className="profile-tele-val">{addresses.length}</span>
              <span className="profile-tele-lbl">Saved Addresses</span>
            </button>
          </div>
        </div>

        <div className="profile-sidebar-divider" />

        <nav className="profile-dashboard__menu" aria-label="Account navigation">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`profile-dashboard__menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="profile-dashboard__menu-icon">{item.icon}</span>
                <span className="profile-dashboard__menu-label">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="profile-menu-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="profile-sidebar-spacer" />

        {/* Compact Concierge & Logout Footer */}
        <div className="profile-sidebar-footer">
          <a
            href="https://wa.me/919999999999?text=Hi%20Lume%20Concierge,%20I%20need%20assistance%20with%20a%20booking"
            target="_blank"
            rel="noopener noreferrer"
            className="profile-concierge-pill"
            title="Chat directly with bridal booking desk on WhatsApp"
          >
            <div className="profile-concierge-pill-icon">
              <MessageCircle size={15} />
            </div>
            <div className="profile-concierge-pill-info">
              <strong>VIP Concierge</strong>
              <span>24/7 WhatsApp Support</span>
            </div>
            <ExternalLink size={12} className="profile-concierge-pill-arrow" />
          </a>

          <button className="profile-dashboard__menu-item logout" onClick={handleLogout}>
            <span className="profile-dashboard__menu-icon">
              <LogOut size={16} />
            </span>
            <span className="profile-dashboard__menu-label">Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── Column 2: Main Dynamic Content ── */}
      <main className="profile-dashboard__main">
        {/* ── Content Panes ── */}
        <div className="profile-content-area">
          {/* TAB 1: MY BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="profile-view-pane">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">My Bookings</h2>
                  <p className="profile-section-desc">
                    Track appointment requests, pay deposits securely, and download receipts.
                  </p>
                </div>

                <div className="profile-bookings-controls">
                  <div className="profile-search-wrap">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search artist or service…"
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                    />
                  </div>

                  <div className="profile-filter-tabs">
                    {['All', 'Upcoming', 'Action Needed', 'Completed', 'Cancelled'].map((tab) => (
                      <button
                        key={tab}
                        className={`profile-filter-tab ${bookingTab === tab ? 'active' : ''}`}
                        onClick={() => setBookingTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isLoadingBookings ? (
                <div className="profile-empty-card">
                  <Loader2 size={32} className="spinner" />
                  <p>Loading your bookings…</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="profile-empty-card">
                  <div className="profile-empty-circle">
                    <Calendar size={32} />
                  </div>
                  <h3>No bookings in this view</h3>
                  <p>
                    {bookingSearch
                      ? `No results matching "${bookingSearch}". Try searching for another artist or service.`
                      : "You don't have any bookings matching this filter. Discover verified makeup and hair artists near you."}
                  </p>
                  <button className="profile-btn profile-btn--primary" onClick={() => navigate('/discover')}>
                    <Sparkles size={16} /> Discover Top Artists
                  </button>
                  <div className="profile-empty-tags">
                    <span>Popular:</span>
                    <button onClick={() => navigate('/discover?category=Bridal')}>Bridal</button>
                    <button onClick={() => navigate('/discover?category=Party')}>Party Glam</button>
                    <button onClick={() => navigate('/discover?category=Hair')}>Hair Styling</button>
                  </div>
                </div>
              ) : (
                <div className="profile-booking-grid">
                  {filteredBookings.map((b: any) => {
                    const artistUser = b.artist?.user;
                    const artistName = artistUser?.name || 'Artist';
                    const artistImg =
                      b.artist?.profileImageUrl ||
                      artistUser?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';
                    const serviceName = b.service?.name || 'Beauty Service';
                    const priceType = b.priceType || 'Standard';
                    const venue = b.address || 'Location provided upon booking';

                    const isPending = b.status === 'PENDING';
                    const isAccepted = b.status === 'ACCEPTED';
                    const isPartiallyPaid = b.status === 'PARTIALLY_PAID';
                    const isConfirmed = b.status === 'CONFIRMED';
                    const isCompleted = b.status === 'COMPLETED';

                    const baseAmt = b.totalPaid || 0;
                    const totalWithGst = Math.round(baseAmt * 1.18);
                    const advancePaid = Math.round(b.advancePaid || 0);
                    const remainingAmt = Math.round(b.remainingAmount || totalWithGst - advancePaid);

                    return (
                      <div key={b.id} className="profile-booking-item">
                        <div className="profile-booking-header">
                          <div className="profile-booking-artist">
                            <img src={artistImg} alt={artistName} className="profile-artist-thumbnail" />
                            <div>
                              <div className="profile-artist-name-wrap">
                                <Link to={`/artist/${b.artist?.slug || getArtistSlug(artistName, b.artist?.id)}`} className="profile-artist-link">
                                  {artistName}
                                </Link>
                                <CheckCircle2 size={15} className="verified-check-icon" />
                              </div>
                              <span className="profile-booking-service">{serviceName} • {priceType}</span>
                            </div>
                          </div>

                          <div className={`profile-status-pill profile-status-pill--${b.status.toLowerCase()}`}>
                            {isPending && 'Request Sent'}
                            {isAccepted && 'Payment Needed'}
                            {isPartiallyPaid && 'Advance Paid (50%)'}
                            {isConfirmed && 'Confirmed'}
                            {isCompleted && 'Completed'}
                            {b.status === 'CANCELLED' && 'Cancelled'}
                          </div>
                        </div>

                        <div className="profile-booking-details-bar">
                          <div className="profile-detail-cell">
                            <Calendar size={15} />
                            <span>{formatDate(b.date)}</span>
                          </div>
                          <div className="profile-detail-cell">
                            <Clock size={15} />
                            <span>{b.time || '10:00 AM'}</span>
                          </div>
                          <div className="profile-detail-cell profile-detail-cell--venue">
                            <MapPin size={15} />
                            <span title={venue}>{venue}</span>
                          </div>
                        </div>

                        {/* Partial Payment Progress Bar */}
                        {isPartiallyPaid && (
                          <div className="profile-payment-meter">
                            <div className="profile-meter-labels">
                              <span>Advance Paid: ₹{advancePaid.toLocaleString('en-IN')}</span>
                              <span className="meter-remaining">
                                Balance Remaining: ₹{remainingAmt.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="profile-meter-track">
                              <div
                                className="profile-meter-fill"
                                style={{ width: `${Math.min(100, Math.round((advancePaid / totalWithGst) * 100))}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="profile-booking-footer">
                          <div className="profile-price-stack">
                            <span className="profile-price-total">₹{totalWithGst.toLocaleString('en-IN')}</span>
                            <span className="profile-price-note">incl. 18% GST (Escrow Protected)</span>
                          </div>

                          <div className="profile-booking-actions">
                            <button
                              className="profile-action-btn profile-action-btn--ghost"
                              onClick={() => setInvoiceBooking(b)}
                              title="View & print invoice"
                            >
                              <Receipt size={15} /> Receipt
                            </button>

                            {isAccepted && (
                              <button
                                className="profile-action-btn profile-action-btn--primary"
                                onClick={() => handlePayNow(b)}
                              >
                                <CreditCard size={15} /> Pay to Confirm
                              </button>
                            )}

                            {isPartiallyPaid && (
                              <button
                                className="profile-action-btn profile-action-btn--primary"
                                onClick={() => handlePayRemaining(b)}
                                disabled={payingRemainingId === b.id}
                              >
                                {payingRemainingId === b.id ? (
                                  <Loader2 size={15} className="spinner" />
                                ) : (
                                  <CreditCard size={15} />
                                )}
                                Pay Remaining (₹{remainingAmt.toLocaleString('en-IN')})
                              </button>
                            )}

                            <Link
                              to={`/artist/${b.artist?.slug || getArtistSlug(artistName, b.artist?.id)}`}
                              className="profile-action-btn profile-action-btn--outline"
                            >
                              <ExternalLink size={14} /> Profile
                            </Link>

                            {b.review ? (
                              <span
                                className="profile-action-btn profile-action-btn--ghost"
                                style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                title="Your review has been submitted"
                              >
                                <Star size={14} fill="#eab308" color="#eab308" /> {b.review.rating}/5 Rated
                              </span>
                            ) : isBookingReviewEligible(b, now) ? (
                              <button
                                className="profile-action-btn profile-action-btn--primary"
                                style={{ background: '#d97a8c', borderColor: '#d97a8c', color: '#fff' }}
                                onClick={() => setReviewingBooking(b)}
                              >
                                <Star size={14} /> Review Artist
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ARTISTS */}
          {activeTab === 'favorites' && (
            <div className="profile-view-pane">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Saved Artists</h2>
                  <p className="profile-section-desc">
                    Your bookmarked beauty artists. Compare portfolios and book your preferred dates.
                  </p>
                </div>
                <button className="profile-btn profile-btn--secondary" onClick={() => navigate('/discover')}>
                  <Plus size={16} /> Browse More Artists
                </button>
              </div>

              {isLoadingFavorites ? (
                <div className="profile-empty-card">
                  <Loader2 size={32} className="spinner" />
                  <p>Loading your saved shortlist…</p>
                </div>
              ) : savedArtists.length === 0 ? (
                <div className="profile-empty-card">
                  <div className="profile-empty-circle">
                    <Heart size={32} />
                  </div>
                  <h3>No saved artists yet</h3>
                  <p>
                    Tap the heart icon on any artist profile to add them to your curated shortlist here.
                  </p>
                  <button className="profile-btn profile-btn--primary" onClick={() => navigate('/discover')}>
                    Explore Artist Directory
                  </button>
                </div>
              ) : (
                <div className="profile-saved-grid">
                  {savedArtists.map((artist) => {
                    const artistName = artist.user?.name || 'Artist';
                    const coverImg =
                      artist.profileImageUrl ||
                      artist.user?.avatarUrl ||
                      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80';
                    const rating = (artist.rating || 5.0).toFixed(1);
                    const locationCity = artist.location || 'Mumbai';
                    const startingPrice = artist.startingPrice || 3500;

                    return (
                      <div key={artist.id} className="profile-saved-card">
                        <div className="profile-saved-card__image-wrap">
                          <img src={coverImg} alt={artistName} className="profile-saved-card__img" />
                          <button
                            className="profile-saved-card__heart is-saved"
                            onClick={() => toggleFavorite(artist.id)}
                            title="Remove from saved"
                            aria-label={`Remove ${artistName} from favorites`}
                          >
                            <Heart size={18} fill="#d45e7e" color="#d45e7e" />
                          </button>
                          <span className="profile-saved-card__city">
                            <MapPin size={12} /> {locationCity}
                          </span>
                        </div>

                        <div className="profile-saved-card__body">
                          <div className="profile-saved-card__title-row">
                            <h3 className="profile-saved-card__name">{artistName}</h3>
                            <div className="profile-saved-card__rating">
                              <Star size={14} fill="#c9a96e" color="#c9a96e" />
                              <span>{rating}</span>
                            </div>
                          </div>

                          <div className="profile-saved-card__specialties">
                            {(artist.specialties || ['Bridal', 'Occasion']).slice(0, 3).map((spec: string) => (
                              <span key={spec} className="profile-specialty-pill">
                                {spec}
                              </span>
                            ))}
                          </div>

                          <div className="profile-saved-card__footer">
                            <div className="profile-saved-card__price">
                              <small>Starting from</small>
                              <strong>₹{startingPrice.toLocaleString('en-IN')}</strong>
                            </div>
                            <Link
                              to={`/artist/${artist.slug || getArtistSlug(artist.user?.name, artist.id)}`}
                              className="profile-btn profile-btn--sm profile-btn--primary"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="profile-view-pane">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Saved Locations & Venues</h2>
                  <p className="profile-section-desc">
                    Manage your home, wedding hall, and hotel addresses for quick 1-click mobile artist booking.
                  </p>
                </div>
                <button className="profile-btn profile-btn--primary" onClick={handleOpenAddAddress}>
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              {profileError && <p role="alert">{profileError}</p>}
              {!addresses.length && <p>Add your first venue and map pin to use it when booking.</p>}
              <div className="profile-addresses-grid">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`profile-address-card ${addr.isDefault ? 'is-default' : ''}`}
                  >
                    <div className="profile-address-card__header">
                      <div className="profile-address-label-wrap">
                        {addr.label === 'Home' && <Home size={16} />}
                        {addr.label === 'Wedding Venue' && <Sparkles size={16} />}
                        {addr.label === 'Hotel / Studio' && <Building2 size={16} />}
                        {addr.label === 'Other' && <MapPin size={16} />}
                        <strong>{addr.label}</strong>
                      </div>
                      {addr.isDefault ? (
                        <span className="profile-default-badge">
                          <Check size={12} /> Default
                        </span>
                      ) : (
                        <button
                          className="profile-set-default-btn"
                          disabled={savingDetails} onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set Default
                        </button>
                      )}
                    </div>

                    <div className="profile-address-card__body">
                      <div className="profile-address-contact">
                        <strong>{addr.recipientName}</strong>

                      </div>
                      <p className="profile-address-street">
                        {addr.apartment && `${addr.apartment}, `}
                        {addr.street}
                      </p>
                      {addr.landmark && (
                        <p className="profile-address-landmark">Landmark: {addr.landmark}</p>
                      )}
                      <p className="profile-address-city">
                        {addr.city} — {addr.pincode}
                      </p>
                    </div>

                    <div className="profile-address-card__actions">
                      <button
                        className="profile-address-btn"
                        onClick={() => handleOpenEditAddress(addr)}
                        title="Edit address"
                      >
                        <Edit3 size={15} /> Edit
                      </button>
                      <button
                        className="profile-address-btn profile-address-btn--danger"
                        disabled={savingDetails} onClick={() => handleDeleteAddress(addr.id)}
                        title="Delete address"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BEAUTY PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="profile-view-pane">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Beauty & Style Profile</h2>
                  <p className="profile-section-desc">
                    Your booked artists can see these preferences when preparing for your appointment.
                  </p>
                </div>

              </div>

              {profileError && <p role="alert">{profileError}</p>}
              {preferencesSaved && (
                <div className="profile-alert profile-alert--success">
                  <CheckCircle2 size={16} /> Your beauty preferences have been updated!
                </div>
              )}

              <div className="profile-preferences-container">
                {/* 1. Skin Profile & Tone */}
                <div className="profile-pref-section">
                  <label className="profile-pref-label">
                    <span>1. Skin Profile & Complexion</span>
                    <small>Helps artists customize preparation and choose ideal foundation formulas</small>
                  </label>
                  <div className="profile-pref-dual-row" style={{ marginTop: 6 }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--mid)', display: 'block', marginBottom: 6 }}>
                        Skin Type
                      </span>
                      <div className="profile-chip-grid" style={{ marginBottom: 8 }}>
                        {SKIN_TYPES.map((type) => {
                          const isSel = preferences.skinType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              className={`profile-pref-chip ${isSel ? 'is-selected' : ''}`}
                              aria-pressed={isSel}
                              onClick={() => setPreferences({ ...preferences, skinType: isSel ? '' : type })}
                            >
                              {isSel && <Check size={14} />} {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--mid)', display: 'block', marginBottom: 6 }}>
                        Complexion Undertone
                      </span>
                      <div className="profile-chip-grid" style={{ marginBottom: 8 }}>
                        {UNDERTONES.map((tone) => {
                          const isSel = preferences.undertone === tone;
                          return (
                            <button
                              key={tone}
                              type="button"
                              className={`profile-pref-chip ${isSel ? 'is-selected' : ''}`}
                              aria-pressed={isSel}
                              onClick={() => setPreferences({ ...preferences, undertone: isSel ? '' : tone })}
                            >
                              {isSel && <Check size={14} />} {tone}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Aesthetics & Look Preferences */}
                <div className="profile-pref-section" style={{ borderTop: '1px solid rgba(42, 26, 31, 0.06)', paddingTop: 20 }}>
                  <label className="profile-pref-label">
                    <span>2. Preferred Makeup & Hair Aesthetics</span>
                    <small>Select all styles that match your signature vibe and upcoming events</small>
                  </label>
                  <div className="profile-chip-grid" style={{ marginTop: 8 }}>
                    {STYLE_OPTIONS.map((style) => {
                      const isSelected = preferences.styles.includes(style);
                      return (
                        <button
                          key={style}
                          type="button"
                          className={`profile-pref-chip ${isSelected ? 'is-selected' : ''}`}
                          aria-pressed={isSelected}
                          onClick={() => toggleStyle(style)}
                        >
                          {isSelected && <Check size={14} />} {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Sensitivities & Allergies */}
                <div className="profile-pref-section" style={{ borderTop: '1px solid rgba(42, 26, 31, 0.06)', paddingTop: 20 }}>
                  <label className="profile-pref-label">
                    <span>3. Product Allergies & Special Notes</span>
                    <small>E.g., fragrance sensitive, cruelty-free only, latex lash glue allergy, prefer organic skincare</small>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={3000}
                    aria-label="Product allergies and special notes"
                    className="profile-form-textarea"
                    placeholder="Tell your artists about any skin sensitivities, preferred luxury brands, or lash requirements…"
                    value={preferences.specialRequests}
                    onChange={(e) =>
                      setPreferences({ ...preferences, specialRequests: e.target.value })
                    }
                    style={{ marginTop: 8 }}
                  />
                </div>

                {/* 4. Live Artist View Card */}
                {(preferences.skinType || preferences.undertone || preferences.styles.length > 0 || preferences.specialRequests) && (
                  <div style={{ background: '#FAF7F5', border: '1px solid rgba(217, 122, 140, 0.2)', borderRadius: 16, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Sparkles size={16} color="var(--rose-deep)" />
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--dark)' }}>
                        How Your Artist Views This Profile
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {preferences.skinType && (
                        <span style={{ background: '#fff', border: '1px solid rgba(42, 26, 31, 0.08)', borderRadius: 99, padding: '4px 10px', fontSize: '0.78rem', color: 'var(--dark)' }}>
                          <strong>Skin:</strong> {preferences.skinType}
                        </span>
                      )}
                      {preferences.undertone && (
                        <span style={{ background: '#fff', border: '1px solid rgba(42, 26, 31, 0.08)', borderRadius: 99, padding: '4px 10px', fontSize: '0.78rem', color: 'var(--dark)' }}>
                          <strong>Undertone:</strong> {preferences.undertone}
                        </span>
                      )}
                      {preferences.styles.map(s => (
                        <span key={s} style={{ background: 'rgba(217, 122, 140, 0.1)', color: 'var(--rose-deep)', borderRadius: 99, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    {preferences.specialRequests && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: 10, marginBottom: 0, fontStyle: 'italic' }}>
                        "{preferences.specialRequests}"
                      </p>
                    )}
                  </div>
                )}

                <button className="profile-btn profile-btn--primary" disabled={savingDetails} onClick={handleSavePreferences}>
                  <Check size={16} /> {savingDetails ? 'Saving…' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE & ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="profile-view-pane">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Profile & Account Settings</h2>
                  <p className="profile-section-desc">
                    Manage your identity, contact information, and primary location details.
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="profile-alert profile-alert--success">
                  <CheckCircle2 size={16} /> Account details saved successfully!
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="profile-settings-form">
                <div className="profile-form-grid">
                  {/* Full Name */}
                  <div className="profile-form-field profile-form-field--full">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email */}
                  <div className="profile-form-field">
                    <label>Email Address</label>
                    <input type="email" disabled value={user?.email || ''} />
                    <span className="profile-field-hint">
                      Verified email linked to your LUME client account.
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="profile-form-field">
                    <label>Mobile Number</label>
                    <PhoneInput
                      required
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={(digits) =>
                        setFormData({ ...formData, phone: digits })
                      }
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="profile-form-field">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>

                  {/* Aadhar / Govt ID */}
                  <div className="profile-form-field">
                    <label>Aadhar ID (Optional Client Verification)</label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12 digit Aadhar number"
                      value={formData.aadharNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aadharNumber: e.target.value.replace(/\D/g, ''),
                        })
                      }
                    />
                  </div>

                  {/* Location with Geo Location Input */}
                  <div className="profile-form-field profile-form-field--full">
                    <label>Primary Location / City</label>
                    <GeoLocationInput
                      value={formData.location}
                      onChange={(location) => setFormData({ ...formData, location })}
                    />
                    <span className="profile-field-hint">
                      Used to filter artists in your metropolitan radius.
                    </span>
                  </div>

                  {/* Bio */}
                  <div className="profile-form-field profile-form-field--full">
                    <label>Personal Bio / About</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Share a short note about your style preferences…"
                    />
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button type="submit" disabled={isSaving} className="profile-btn profile-btn--primary">
                    {isSaving ? <Loader2 size={16} className="spinner" /> : <Check size={16} />}
                    {isSaving ? 'Saving Changes…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: CONCIERGE & HELP */}
          {activeTab === 'help' && (
            <div className="profile-view-pane">
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">VIP Concierge & Support</h2>
                  <p className="profile-section-desc">
                    Need bridal coordination, group bookings, or have booking questions? We are here 24/7.
                  </p>
                </div>
              </div>

              {/* 3 Concierge Highlights */}
              <div className="profile-help-cards-grid">
                <div className="profile-help-card">
                  <div className="profile-help-card__icon profile-help-card__icon--whatsapp">
                    <MessageCircle size={24} />
                  </div>
                  <h3>WhatsApp Concierge</h3>
                  <p>Chat directly with our dedicated bridal booking specialists in Mumbai & Pune.</p>
                  <a
                    href="https://wa.me/919999999999?text=Hi%20Lume%20Concierge,%20I%20have%20a%20booking%20query"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-help-card__link"
                  >
                    Open WhatsApp Chat <ExternalLink size={14} />
                  </a>
                </div>

                <div className="profile-help-card">
                  <div className="profile-help-card__icon profile-help-card__icon--mail">
                    <Mail size={24} />
                  </div>
                  <h3>Email Support Desk</h3>
                  <p>Inquiries, custom invoicing, vendor onboarding and client safety assistance.</p>
                  <a href="mailto:Hellolumeadmin@gmail.com" className="profile-help-card__link">
                    Hellolumeadmin@gmail.com <ExternalLink size={14} />
                  </a>
                </div>

                <div className="profile-help-card">
                  <div className="profile-help-card__icon profile-help-card__icon--shield">
                    <ShieldCheck size={24} />
                  </div>
                  <h3>100% Escrow Protection</h3>
                  <p>Every advance and payment is safely held until the artist delivers the requested look.</p>
                  <span className="profile-help-card__badge">Razorpay Verified Escrow</span>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="profile-faq-section">
                <h3 className="profile-faq-title">Frequently Asked Questions</h3>
                <div className="profile-faq-list">
                  {FAQS.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={idx} className={`profile-faq-item ${isOpen ? 'is-open' : ''}`}>
                        <button
                          className="profile-faq-question"
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {isOpen && <div className="profile-faq-answer">{faq.a}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Luxury Bottom Features Strip */}
          <section className="profile-trust-strip">
            <div className="profile-trust-item">
              <div className="profile-trust-icon profile-trust-icon--shield">
                <ShieldCheck size={22} />
              </div>
              <div>
                <strong>Verified Artist Escrow</strong>
                <p>100% secure payments held until your appointment is completed.</p>
              </div>
            </div>

            <div className="profile-trust-item">
              <div className="profile-trust-icon profile-trust-icon--clock">
                <Clock size={22} />
              </div>
              <div>
                <strong>Flexible Rescheduling</strong>
                <p>Seamless calendar alignment and backup artist coverage.</p>
              </div>
            </div>

            <div className="profile-trust-item">
              <div className="profile-trust-icon profile-trust-icon--headset">
                <Headset size={22} />
              </div>
              <div>
                <strong>24/7 Dedicated Support</strong>
                <p>Always available to ensure your special day is flawless.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {showAddressModal && <BookingLocationModal isOpen initialMode="form" editingAddress={editingAddress}
        title={editingAddress ? 'Edit saved address' : 'Add new address'} confirmButtonLabel="Save address"
        onSelectAddress={() => setProfileError('')} onClose={() => setShowAddressModal(false)} />}

      {/* ── Modal: Official Booking Receipt / Invoice ── */}
      {invoiceBooking && (
        <div className="profile-modal-overlay" role="dialog" aria-modal="true">
          <div className="profile-modal-card profile-invoice-modal">
            <div className="profile-modal-header">
              <div>
                <span className="profile-invoice-eyebrow">Official LUME Receipt</span>
                <h3>Booking #{invoiceBooking.id.slice(-8).toUpperCase()}</h3>
              </div>
              <button
                className="profile-modal-close"
                onClick={() => setInvoiceBooking(null)}
                aria-label="Close invoice"
              >
                <X size={20} />
              </button>
            </div>

            <div className="profile-invoice-content" id="lume-printable-receipt">
              <div className="profile-invoice-header-strip">
                <div>
                  <strong>LUME BEAUTY PLATFORM</strong>
                  <p>Premier Beauty Artist Booking & Escrow Services</p>
                  <span>GSTIN: 27AABCL1234F1Z8</span>
                </div>
                <div className="profile-invoice-status">
                  <span className={`profile-status-pill profile-status-pill--${invoiceBooking.status.toLowerCase()}`}>
                    {invoiceBooking.status}
                  </span>
                  <small>Dated: {formatDate(invoiceBooking.date)}</small>
                </div>
              </div>

              <div className="profile-invoice-parties">
                <div>
                  <small>BOOKED FOR (CLIENT):</small>
                  <strong>{user?.name}</strong>
                  <p>{user?.email}</p>
                  <p>{invoiceBooking.address || 'Address on record'}</p>
                </div>
                <div>
                  <small>ARTIST DETAILS:</small>
                  <strong>{invoiceBooking.artist?.user?.name || 'Beauty Artist'}</strong>
                  <p>{invoiceBooking.service?.name || 'Custom Package'}</p>
                  <p>Slot: {invoiceBooking.time || '10:00 AM'}</p>
                </div>
              </div>

              <table className="profile-invoice-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Rate</th>
                    <th>GST (18%)</th>
                    <th style={{ textAlign: 'right' }}>Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{invoiceBooking.service?.name || 'Beauty Booking'}</strong>
                      <br />
                      <small>Session Date: {formatDate(invoiceBooking.date)}</small>
                    </td>
                    <td>₹{(invoiceBooking.totalPaid || 0).toLocaleString('en-IN')}</td>
                    <td>₹{Math.round((invoiceBooking.totalPaid || 0) * 0.18).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      ₹{Math.round((invoiceBooking.totalPaid || 0) * 1.18).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="profile-invoice-breakdown">
                <div className="profile-invoice-breakdown-row">
                  <span>Base Service Fee:</span>
                  <span>₹{(invoiceBooking.totalPaid || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="profile-invoice-breakdown-row">
                  <span>Applicable GST (18%):</span>
                  <span>₹{Math.round((invoiceBooking.totalPaid || 0) * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="profile-invoice-breakdown-row profile-invoice-breakdown-row--grand">
                  <span>Total Amount Payable:</span>
                  <span>₹{Math.round((invoiceBooking.totalPaid || 0) * 1.18).toLocaleString('en-IN')}</span>
                </div>
                {invoiceBooking.advancePaid > 0 && (
                  <div className="profile-invoice-breakdown-row">
                    <span>Advance Paid Online:</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>
                      - ₹{Math.round(invoiceBooking.advancePaid).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {invoiceBooking.remainingAmount > 0 && (
                  <div className="profile-invoice-breakdown-row">
                    <span>Balance Remaining:</span>
                    <span style={{ color: '#d97706', fontWeight: 700 }}>
                      ₹{Math.round(invoiceBooking.remainingAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              <div className="profile-invoice-seal">
                <ShieldCheck size={20} color="#059669" />
                <span>Verified LUME Razorpay Escrow Guarantee • Payment Protected</span>
              </div>
            </div>

            <div className="profile-modal-actions">
              <button
                className="profile-btn profile-btn--secondary"
                onClick={() => setInvoiceBooking(null)}
              >
                Close
              </button>
              <button
                className="profile-btn profile-btn--primary"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modal ── */}
      {showPaymentModal && selectedBookingForPayment && (
        <PaymentOptionsModal
          booking={selectedBookingForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBookingForPayment(null);
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedBookingForPayment(null);
            fetchBookings();
          }}
        />
      )}
      {/* ── Review Modal ── */}
      {reviewingBooking && (
        <ReviewModal
          isOpen={Boolean(reviewingBooking)}
          bookingId={reviewingBooking.id}
          artistName={reviewingBooking.artist?.user?.name || 'Artist'}
          serviceName={reviewingBooking.service?.name}
          bookingDateLabel={formatDate(reviewingBooking.date)}
          onClose={() => setReviewingBooking(null)}
          onSuccess={(review) => {
            setBookings((prev) =>
              prev.map((item) =>
                item.id === reviewingBooking.id ? { ...item, review } : item
              )
            );
            void fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;