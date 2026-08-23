import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, Lock, Shield,
  Headphones, Sparkles, Clock, CalendarCheck, ShieldCheck,
  Award, Check, MapPin, CheckCircle2, Star, Camera, ChevronRight,
  Users, Briefcase, BadgeCheck, TrendingUp, AlertCircle, Loader2,
} from 'lucide-react';
import useFavorites from '../hooks/useFavorites';
import Button from '../components/ui/Button';
import { useAuth, API_BASE } from '../context/AuthContext';
import './ArtistDetailPage.css';

type TabId = 'services' | 'portfolio' | 'reviews';
type PriceType = 'WEDDING' | 'OCCASION' | 'HOURLY';

interface ApiArtist {
  id: string;
  bio?: string;
  gender?: string;
  location: string;
  experience: number;
  certification?: string;
  profileImageUrl?: string;
  badge?: string;
  isVerified: boolean;
  verificationStatus: string;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  specialties: string[];
  startingPrice: number;
  weddingPrice?: number;
  occasionPrice?: number;
  hourlyPrice?: number;
  portfolioUrls?: string[];
  instagramUrl?: string;
  services: ServiceItem[];
  user: { id: string; name: string; email: string; avatarUrl?: string; };
  reviews?: ReviewItem[];
  isTakingBookings?: boolean;
}

interface ServiceItem {
  id: string; name: string; price: number; duration: number; icon: string; description?: string; isActive: boolean;
}

interface ReviewItem {
  id: string; rating: number; comment: string; createdAt: string;
  client: { name: string; avatarUrl?: string; };
}

interface AvailabilityData {
  availability: Array<{ date: string; timeSlots: Array<{ time: string; available: boolean; }>; }>;
  defaultSchedule: Array<{ dayOfWeek: number; timeSlots: Array<{ time: string; available: boolean; }>; }>;
  blockedDates: Array<{ date: string; }>;
}

const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  WEDDING: '💍 Wedding',
  OCCASION: '🎉 Occasion',
  HOURLY: '⏱ Hourly',
};

// loadRazorpayScript removed as it is now in ProfilePage

const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  const [artist, setArtist] = useState<ApiArtist | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loadingArtist, setLoadingArtist] = useState(true);
  const [artistError, setArtistError] = useState('');

  // Booking state
  const [selectedPriceType, setSelectedPriceType] = useState<PriceType>('OCCASION');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('services');
  const [isTabSticky, setIsTabSticky] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth <= 768);

  const { isFavorite, toggleFavorite } = useFavorites();

  const tabNavRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const portfolioRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);

  // Fetch artist data
  useEffect(() => {
    if (!id) return;
    setLoadingArtist(true);
    setArtistError('');
    window.scrollTo(0, 0);

    Promise.all([
      fetch(`${API_BASE}/api/artists/${id}`).then(r => r.json()),
      fetch(`${API_BASE}/api/artists/${id}/availability?fromDate=${new Date().toISOString().split('T')[0]}&toDate=${new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}`).then(r => r.json()),
    ]).then(([artistRes, availRes]) => {
      if (artistRes.success) setArtist(artistRes.data);
      else setArtistError('Artist not found');
      if (availRes.success) setAvailability(availRes.data);
    }).catch(() => setArtistError('Failed to load artist'))
      .finally(() => setLoadingArtist(false));
  }, [id]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sticky tab observer
  useEffect(() => {
    const tabEl = tabNavRef.current;
    if (!tabEl) return;
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'height:1px;width:1px;position:absolute;top:-1px;';
    tabEl.parentElement?.insertBefore(sentinel, tabEl);
    const observer = new IntersectionObserver(([entry]) => setIsTabSticky(!entry.isIntersecting), { threshold: 0 });
    observer.observe(sentinel);
    return () => { observer.disconnect(); sentinel.remove(); };
  }, [artist]);

  const [acceptedBooking, setAcceptedBooking] = useState<any>(null);

  // Scroll-spy for tabs
  useEffect(() => {
    if (isMobileView) return;
    const handleScroll = () => {
      const offset = 200;
      const sections = [
        { id: 'services' as TabId, ref: servicesRef },
        { id: 'portfolio' as TabId, ref: portfolioRef },
        { id: 'reviews' as TabId, ref: reviewsRef },
      ];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].ref.current;
        if (el && el.getBoundingClientRect().top <= offset) { setActiveTab(sections[i].id); break; }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileView, artist]);

  // Fetch accepted booking for client
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CLIENT' && artist?.id) {
      fetch(`${API_BASE}/api/clients/me/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const b = data.data.find((x: any) => x.artistId === artist.id && x.status === 'ACCEPTED');
          if (b) setAcceptedBooking(b);
        }
      })
      .catch(err => console.error("Failed to fetch client bookings", err));
    }
  }, [isAuthenticated, user, artist?.id, token]);

  const scrollToSection = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (window.innerWidth <= 768) tabNavRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else ({ services: servicesRef, portfolio: portfolioRef, reviews: reviewsRef }[tab]).current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Get available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate || !availability) return [];
    const blocked = availability.blockedDates.some(b => b.date.startsWith(selectedDate));
    if (blocked) return [];

    // Check per-day override first
    const override = availability.availability.find(a => a.date.startsWith(selectedDate));
    if (override) {
      return override.timeSlots.filter(s => s.available).map(s => s.time);
    }

    // Fall back to default schedule
    const dow = new Date(selectedDate + 'T00:00:00').getDay();
    const def = availability.defaultSchedule.find(d => d.dayOfWeek === dow);
    if (def) return (def.timeSlots as any[]).filter((s: any) => s.available).map((s: any) => s.time);
    return [];
  }, [selectedDate, availability]);

  // Generate next 30 days for date picker
  const upcomingDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // Price calculation
  const calculatedPrice = useMemo(() => {
    if (!artist) return 0;
    if (selectedPriceType === 'WEDDING') return artist.weddingPrice || 0;
    if (selectedPriceType === 'OCCASION') return artist.occasionPrice || 0;
    if (selectedPriceType === 'HOURLY' && selectedTimeSlots.length > 0) {
      return (artist.hourlyPrice || 0) * selectedTimeSlots.length;
    }
    return artist.startingPrice || 0;
  }, [artist, selectedPriceType, selectedTimeSlots]);

  const isBookingReady = selectedDate && selectedTimeSlots.length > 0;

  const handleBookingConfirm = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isBookingReady || !artist || bookingLoading || showSuccessModal) return;
    
    setBookingLoading(true); 
    setBookingError('');

    try {
      // Create the Booking (Status: PENDING)
      const bookingRes = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          artistId: artist.id,
          serviceId: selectedServiceId || undefined,
          date: selectedDate,
          time: selectedTimeSlots.join(', '),
          priceType: selectedPriceType,
          notes,
          address,
        }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.message || 'Booking failed');

      // Show success modal instead of navigating to confirm page
      setShowSuccessModal(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const ratingDistribution = useMemo(() => {
    if (!artist?.reviews?.length) return [0, 0, 0, 0, 0];
    const dist = [0, 0, 0, 0, 0];
    artist.reviews.forEach(r => { const b = Math.min(Math.floor(r.rating), 5) - 1; if (b >= 0) dist[b]++; });
    return dist;
  }, [artist]);

  // ──── RENDER ────

  if (loadingArtist) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 12, color: 'var(--rose-deep)' }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '1rem', fontWeight: 600 }}>Loading artist...</span>
    </div>
  );

  if (artistError || !artist) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
      <AlertCircle size={40} color="var(--rose-deep)" />
      <p style={{ fontWeight: 600, color: 'var(--dark)' }}>Artist not found</p>
      <Button onClick={() => navigate('/discover')}>Browse Artists</Button>
    </div>
  );

  const avatarSrc = artist.profileImageUrl
    ? (artist.profileImageUrl.startsWith('/') ? `${API_BASE}${artist.profileImageUrl}` : artist.profileImageUrl)
    : (artist.user.avatarUrl ? (artist.user.avatarUrl.startsWith('/') ? `${API_BASE}${artist.user.avatarUrl}` : artist.user.avatarUrl) : null);

  const portfolioImages = artist.portfolioUrls?.length
    ? artist.portfolioUrls.map(url => url.startsWith('/') ? `${API_BASE}${url}` : url)
    : [];

  const availPriceTypes: PriceType[] = [];
  if (artist.weddingPrice) availPriceTypes.push('WEDDING');
  if (artist.occasionPrice) availPriceTypes.push('OCCASION');
  if (artist.hourlyPrice) availPriceTypes.push('HOURLY');

  const completedSteps = [
    availPriceTypes.length === 0 || selectedPriceType,
    selectedDate,
    selectedTimeSlots.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="adp">
      {/* ═══ HERO GALLERY ═══ */}
      <section className="adp-gallery">
        <div className="adp-gallery__grid">
          <div className="adp-gallery__main">
            {avatarSrc
              ? <img src={avatarSrc} alt={artist.user.name} className="adp-gallery__img" />
              : <div className="adp-gallery__img" style={{ background: 'linear-gradient(135deg,#F2A4B0,#C9956A)', display:'flex',alignItems:'center',justifyContent:'center',fontSize:'4rem' }}>✨</div>
            }
          </div>
          <div className="adp-gallery__side">
            {portfolioImages.slice(0, 2).map((img, i) => (
              <div key={i} className="adp-gallery__side-img">
                <img src={img} alt={`${artist.user.name} work ${i + 1}`} className="adp-gallery__img" />
              </div>
            ))}
            {portfolioImages.length < 2 && (
              <div className="adp-gallery__side-img" style={{ background: 'linear-gradient(135deg,#f8e1e8,#fce8ec)', display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Camera size={32} style={{ color: 'var(--rose-mid)', opacity: 0.5 }} />
              </div>
            )}
          </div>
          <div className="adp-gallery__overlay">
            <button className="adp-gallery__action-btn" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button>
            <div className="adp-gallery__action-group">
              {portfolioImages.length > 0 && (
                <button className="adp-gallery__action-btn adp-gallery__action-btn--photos">
                  <Camera size={16} /><span>{portfolioImages.length} Photos</span>
                </button>
              )}
              <button
                className={`adp-gallery__action-btn ${isFavorite(artist.id) ? 'adp-gallery__action-btn--active' : ''}`}
                onClick={() => toggleFavorite(artist.id)} aria-label="Favorite">
                <Heart size={18} fill={isFavorite(artist.id) ? 'currentColor' : 'none'} />
              </button>
              <button className="adp-gallery__action-btn" aria-label="Share"><Share2 size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROFILE INFO BAR ═══ */}
      <section className="adp-profile">
        <div className="adp-profile__container">
          <div className="adp-profile__info">
            <div className="adp-profile__avatar-wrap">
              {avatarSrc
                ? <img src={avatarSrc} alt={artist.user.name} className="adp-profile__avatar" />
                : <div className="adp-profile__avatar" style={{ background: 'linear-gradient(135deg,#F2A4B0,#C9956A)', display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem' }}>✨</div>
              }
              {artist.isVerified && <span className="adp-profile__verified"><BadgeCheck size={16} /></span>}
            </div>
            <div className="adp-profile__details">
              <div className="adp-profile__name-row">
                <h1 className="adp-profile__name">{artist.user.name}</h1>
                {artist.badge && (
                  <span className="adp-profile__badge"><Sparkles size={12} />{artist.badge}</span>
                )}
                {artist.isVerified && (
                  <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(34,197,94,0.1)',color:'#16a34a',padding:'3px 10px',borderRadius:20,fontSize:'0.72rem',fontWeight:700 }}>
                    ✅ Verified
                  </span>
                )}
                {artist.isTakingBookings ? (
                  <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(34,197,94,0.1)',color:'#16a34a',padding:'3px 10px',borderRadius:20,fontSize:'0.72rem',fontWeight:700 }}>
                    Taking Bookings
                  </span>
                ) : (
                  <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(239,68,68,0.1)',color:'#dc2626',padding:'3px 10px',borderRadius:20,fontSize:'0.72rem',fontWeight:700 }}>
                    Not Taking Bookings
                  </span>
                )}
              </div>
              {artist.certification && <p className="adp-profile__certification">{artist.certification}</p>}
              <div className="adp-profile__meta">
                <span className="adp-profile__meta-item"><MapPin size={14} />{artist.location}</span>
                <span className="adp-profile__meta-divider">•</span>
                <span className="adp-profile__meta-item adp-profile__meta-item--rating">
                  <Star size={14} fill="var(--gold)" color="var(--gold)" />
                  {artist.rating.toFixed(1)}
                  <span className="adp-profile__meta-count">({artist.reviewCount} reviews)</span>
                </span>
                <span className="adp-profile__meta-divider">•</span>
                <span className="adp-profile__meta-item"><Briefcase size={14} />{artist.experience}+ yrs</span>
              </div>
              <div className="adp-profile__specialties">
                {artist.specialties.map(s => <span key={s} className="adp-profile__specialty-tag">{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STICKY TABS ═══ */}
      <div className={`adp-tabs-wrapper ${isTabSticky ? 'adp-tabs-wrapper--sticky' : ''}`} ref={tabNavRef}>
        <nav className="adp-tabs" role="tablist">
          {(['services', 'portfolio', 'reviews'] as TabId[]).map(tab => (
            <button key={tab} role="tab" aria-selected={activeTab === tab}
              className={`adp-tabs__tab ${activeTab === tab ? 'adp-tabs__tab--active' : ''}`}
              onClick={() => scrollToSection(tab)}>
              {tab === 'services' && <Briefcase size={16} />}
              {tab === 'portfolio' && <Camera size={16} />}
              {tab === 'reviews' && <Star size={16} />}
              <span>{tab === 'services' ? 'Book Now' : tab === 'portfolio' ? `Portfolio (${portfolioImages.length})` : `Reviews (${artist.reviewCount})`}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="adp-content">
        <div className="adp-body">

          {/* ── LEFT COLUMN ── */}
          <div className="adp-main">

            {/* About */}
            {(!isMobileView || activeTab === 'services') && (
              <>
                <section className="adp-section adp-about">
                  <h2 className="adp-section__title"><Users size={20} />About {artist.user.name}</h2>
                  <p className="adp-about__bio">
                    {artist.bio || `Specializing in ${artist.specialties.slice(0, 2).map(s => s.toLowerCase()).join(', ')} & luxury makeup. With over ${artist.experience} years of experience and ${artist.bookingCount}+ successful bookings, ${artist.user.name.split(' ')[0]} is one of the most sought-after makeup artists in ${artist.location}.`}
                  </p>
                  <div className="adp-about__stats">
                    <div className="adp-about__stat"><Award size={18} /><div><span className="adp-about__stat-value">{artist.experience}+ Years</span><span className="adp-about__stat-label">Experience</span></div></div>
                    <div className="adp-about__stat"><Users size={18} /><div><span className="adp-about__stat-value">{artist.bookingCount}+</span><span className="adp-about__stat-label">Bookings Done</span></div></div>
                    <div className="adp-about__stat"><Star size={18} /><div><span className="adp-about__stat-value">{artist.rating.toFixed(1)} ★</span><span className="adp-about__stat-label">Average Rating</span></div></div>
                    {artist.isVerified && <div className="adp-about__stat"><CheckCircle2 size={18} /><div><span className="adp-about__stat-value">Verified</span><span className="adp-about__stat-label">Admin Verified</span></div></div>}
                  </div>
                </section>

                {/* ── BOOKING SECTION ── */}
                <section className="adp-section adp-booking-section" ref={servicesRef} id="services">
                  <h2 className="adp-section__title"><Sparkles size={20} />Book Your Session</h2>

                  {/* Progress */}
                  <div className="adp-progress">
                    {[1, 2, 3].map(step => (
                      <React.Fragment key={step}>
                        <div className={`adp-progress__step ${completedSteps >= step ? 'adp-progress__step--done' : ''} ${completedSteps === step - 1 ? 'adp-progress__step--current' : ''}`}>
                          <div className="adp-progress__circle">{completedSteps >= step ? <Check size={14} /> : step}</div>
                          <span className="adp-progress__label">{step === 1 ? 'Occasion' : step === 2 ? 'Date' : 'Time'}</span>
                        </div>
                        {step < 3 && <div className={`adp-progress__line ${completedSteps >= step ? 'adp-progress__line--done' : ''}`} />}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Step 1 – Pricing Type */}
                  {availPriceTypes.length > 0 ? (
                    <div className="adp-step">
                      <div className="adp-step__header">
                        <span className="adp-step__number">STEP 01</span>
                        <h3 className="adp-step__title">Choose Occasion & Pricing</h3>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {availPriceTypes.map(pt => {
                          const prices = { WEDDING: artist.weddingPrice, OCCASION: artist.occasionPrice, HOURLY: artist.hourlyPrice };
                          return (
                            <button key={pt} type="button"
                              onClick={() => { setSelectedPriceType(pt); setSelectedServiceId(null); }}
                              style={{
                                display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                                border: selectedPriceType === pt ? '2px solid var(--rose-deep)' : '1.5px solid rgba(42,26,31,0.12)',
                                background: selectedPriceType === pt ? 'var(--rose-pale)' : 'white', textAlign: 'left', transition: 'all .15s',
                              }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: selectedPriceType === pt ? 'var(--rose-deep)' : 'var(--dark)' }}>
                                {PRICE_TYPE_LABELS[pt]}
                              </span>
                              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--rose-deep)' }}>
                                ₹{(prices[pt] || 0).toLocaleString()}{pt === 'HOURLY' ? '/hr' : ''}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {selectedPriceType === 'HOURLY' && (
                        <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--rose-pale)', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--rose-deep)' }}>
                          Tip: Select multiple time slots in Step 3 to book several hours.
                          {selectedTimeSlots.length > 0 && <span style={{display: 'block', marginTop: 4, fontWeight: 700}}>Total: ₹{calculatedPrice.toLocaleString()}</span>}
                        </div>
                      )}
                      {/* Optional: link to a specific service */}
                      {artist.services.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--mid)', display: 'block', marginBottom: 6 }}>Specific Service (optional)</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {artist.services.map(s => (
                              <button key={s.id} type="button"
                                onClick={() => setSelectedServiceId(selectedServiceId === s.id ? null : s.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                                  border: selectedServiceId === s.id ? '1.5px solid var(--rose-deep)' : '1px solid rgba(42,26,31,0.12)',
                                  background: selectedServiceId === s.id ? 'var(--rose-pale)' : 'white',
                                  color: selectedServiceId === s.id ? 'var(--rose-deep)' : 'var(--mid)',
                                }}>
                                {s.icon} {s.name} — ₹{s.price.toLocaleString()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="adp-step">
                      <div className="adp-step__header"><span className="adp-step__number">STEP 01</span><h3 className="adp-step__title">Select Service</h3></div>
                      {artist.services.length === 0 ? (
                        <div style={{ padding: 16, background: 'rgba(42,26,31,0.04)', borderRadius: 12, color: 'var(--mid)', fontSize: '0.88rem' }}>
                          This artist hasn't added services yet. Contact them directly.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {artist.services.map(s => (
                            <button key={s.id} type="button"
                              onClick={() => setSelectedServiceId(selectedServiceId === s.id ? null : s.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
                                border: selectedServiceId === s.id ? '2px solid var(--rose-deep)' : '1.5px solid rgba(42,26,31,0.12)',
                                background: selectedServiceId === s.id ? 'var(--rose-pale)' : 'white',
                                fontWeight: 600, color: selectedServiceId === s.id ? 'var(--rose-deep)' : 'var(--dark)', fontSize: '0.88rem',
                              }}>
                              {s.icon} {s.name} <span style={{ color: 'var(--rose-deep)', marginLeft: 4 }}>₹{s.price.toLocaleString()}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2 – Date */}
                  <div className="adp-step">
                    <div className="adp-step__header"><span className="adp-step__number">STEP 02</span><h3 className="adp-step__title">Select Date</h3></div>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
                      {upcomingDates.map(dateStr => {
                        const d = new Date(dateStr + 'T00:00:00');
                        const isBlocked = availability?.blockedDates.some(b => b.date.startsWith(dateStr));
                        const slots = (() => {
                          const override = availability?.availability.find(a => a.date.startsWith(dateStr));
                          if (override) return override.timeSlots.filter((s: any) => s.available).length;
                          const dow = d.getDay();
                          const def = availability?.defaultSchedule.find(ds => ds.dayOfWeek === dow);
                          return def ? (def.timeSlots as any[]).filter((s: any) => s.available).length : 0;
                        })();
                        return (
                          <button key={dateStr} type="button" disabled={!!isBlocked || slots === 0}
                            onClick={() => { setSelectedDate(dateStr); setSelectedTimeSlots([]); }}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 14px', borderRadius: 12, minWidth: 64,
                              border: selectedDate === dateStr ? '2px solid var(--rose-deep)' : '1px solid rgba(42,26,31,0.12)',
                              background: selectedDate === dateStr ? 'var(--rose-pale)' : (isBlocked || slots === 0) ? '#f5f5f5' : 'white',
                              cursor: (isBlocked || slots === 0) ? 'not-allowed' : 'pointer', opacity: (isBlocked || slots === 0) ? 0.4 : 1,
                            }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--mid)', textTransform: 'uppercase' }}>
                              {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                            </span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: selectedDate === dateStr ? 'var(--rose-deep)' : 'var(--dark)' }}>
                              {d.getDate()}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: slots > 0 ? 'var(--rose-deep)' : 'var(--mid)', fontWeight: 600 }}>
                              {isBlocked ? 'Off' : slots > 0 ? `${slots} slots` : 'Full'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3 – Time */}
                  {selectedDate && (
                    <div className="adp-step">
                      <div className="adp-step__header"><span className="adp-step__number">STEP 03</span><h3 className="adp-step__title">Select Time Slot</h3></div>
                      {availableSlots.length === 0 ? (
                        <div style={{ padding: 14, background: 'rgba(239,68,68,0.06)', borderRadius: 10, color: 'var(--mid)', fontSize: '0.88rem' }}>
                          No slots available for this date.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {availableSlots.map(slot => {
                            const [startHour] = slot.split(':').map(Number);
                            const endSlot = `${(startHour + 1).toString().padStart(2, '0')}:00`;
                            const isSelected = selectedTimeSlots.includes(slot);
                            
                            return (
                              <button key={slot} type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot));
                                  } else {
                                    setSelectedTimeSlots([...selectedTimeSlots, slot]);
                                  }
                                }}
                                style={{
                                  padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                                  border: isSelected ? '2px solid var(--rose-deep)' : '1px solid rgba(42,26,31,0.12)',
                                  background: isSelected ? 'var(--rose-deep)' : 'white',
                                  color: isSelected ? 'white' : 'var(--dark)',
                                }}>
                                {slot} - {endSlot}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Address & Notes */}
                  {isBookingReady && (
                    <div className="adp-step">
                      <div className="adp-step__header"><span className="adp-step__number">STEP 04</span><h3 className="adp-step__title">Location & Notes</h3></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input type="text" placeholder="Event address / venue" value={address} onChange={e => setAddress(e.target.value)}
                          style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid rgba(42,26,31,0.14)', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }} />
                        <textarea placeholder="Any special requests, allergies, or notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                          style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid rgba(42,26,31,0.14)', fontSize: '0.9rem', width: '100%', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Portfolio */}
            {(!isMobileView || activeTab === 'portfolio') && (
              <section className="adp-section adp-portfolio adp-tab-pane" ref={portfolioRef} id="portfolio">
                <h2 className="adp-section__title"><Camera size={20} />Portfolio<span className="adp-section__count">{portfolioImages.length}</span></h2>
                {portfolioImages.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--mid)', fontSize: '0.88rem' }}>No portfolio photos yet.</div>
                ) : (
                  <div className="adp-portfolio__grid">
                    {portfolioImages.map((img, i) => (
                      <div key={i} className="adp-portfolio__item" style={{ animationDelay: `${i * 0.08}s` }}>
                        <img src={img} alt={`${artist.user.name} portfolio ${i + 1}`} className="adp-portfolio__img" loading="lazy" />
                        <div className="adp-portfolio__hover"><Camera size={24} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Reviews */}
            {(!isMobileView || activeTab === 'reviews') && (
              <section className="adp-section adp-reviews adp-tab-pane" ref={reviewsRef} id="reviews">
                <h2 className="adp-section__title"><Star size={20} />Reviews & Ratings</h2>
                <div className="adp-reviews__summary">
                  <div className="adp-reviews__score">
                    <span className="adp-reviews__score-value">{artist.rating.toFixed(1)}</span>
                    <div className="adp-reviews__score-stars">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill={i < Math.floor(artist.rating) ? 'var(--gold)' : 'transparent'} color="var(--gold)" />)}
                    </div>
                    <span className="adp-reviews__score-count">{artist.reviewCount} reviews</span>
                  </div>
                  <div className="adp-reviews__distribution">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = ratingDistribution[star - 1];
                      const pct = artist.reviews?.length ? (count / artist.reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="adp-reviews__bar-row">
                          <span className="adp-reviews__bar-label">{star}<Star size={10} fill="var(--gold)" color="var(--gold)" /></span>
                          <div className="adp-reviews__bar-track"><div className="adp-reviews__bar-fill" style={{ width: `${pct}%` }} /></div>
                          <span className="adp-reviews__bar-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="adp-reviews__list">
                  {(!artist.reviews || artist.reviews.length === 0) ? (
                    <p style={{ color: 'var(--mid)', fontSize: '0.88rem' }}>No reviews yet. Be the first to book!</p>
                  ) : (
                    (showAllReviews ? artist.reviews : artist.reviews.slice(0, 3)).map(r => (
                      <div key={r.id} style={{ padding: '14px', background: 'var(--rose-pale)', borderRadius: 12, marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{r.client?.name || 'Anonymous'}</span>
                          <span style={{ color: 'var(--gold)', fontSize: '0.82rem' }}>{'★'.repeat(Math.round(r.rating))}</span>
                        </div>
                        <p style={{ color: 'var(--mid)', fontSize: '0.85rem', margin: 0 }}>{r.comment}</p>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 4, display: 'block' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {artist.reviews && artist.reviews.length > 3 && (
                  <button className="adp-reviews__toggle" onClick={() => setShowAllReviews(!showAllReviews)}>
                    {showAllReviews ? 'Show Less' : `View All ${artist.reviews.length} Reviews`}
                    <ChevronRight size={16} className={showAllReviews ? 'adp-reviews__toggle-icon--up' : ''} />
                  </button>
                )}
              </section>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="adp-sidebar">
            <div className="adp-sidebar__booking">
              <div className="adp-sidebar__booking-header-top">
                <div className="adp-sidebar__price-main">
                  <span className="adp-sidebar__price-label">
                    {selectedPriceType === 'WEDDING' ? '💍 Wedding' : selectedPriceType === 'OCCASION' ? '🎉 Occasion' : selectedPriceType === 'HOURLY' ? '⏱ Hourly' : 'Starting at'}
                  </span>
                  <span className="adp-sidebar__price-value">₹{calculatedPrice.toLocaleString()}</span>
                  {selectedPriceType === 'HOURLY' && <span className="adp-sidebar__price-per">per hour</span>}
                </div>
                {artist.isVerified && <div className="adp-sidebar__demand"><TrendingUp size={14} /><span>Verified Artist</span></div>}
              </div>

              <div className="adp-sidebar__booking-header"><CalendarCheck size={18} /><h3>Booking Summary</h3></div>

              <div className="adp-sidebar__booking-list">
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Artist</span>
                  <span className="adp-sidebar__booking-val adp-sidebar__booking-val--artist">{artist.user.name}</span>
                </div>
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Occasion</span>
                  <span className="adp-sidebar__booking-val">{PRICE_TYPE_LABELS[selectedPriceType]}</span>
                </div>
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Date</span>
                  <span className="adp-sidebar__booking-val">
                    {selectedDate
                      ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                      : <em className="adp-sidebar__booking-empty">Not selected</em>}
                  </span>
                </div>
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Time</span>
                  <span className="adp-sidebar__booking-val">
                    {selectedTimeSlots.length > 0
                      ? selectedTimeSlots.join(', ')
                      : <em className="adp-sidebar__booking-empty">Not selected</em>}
                  </span>
                </div>
                <div className="adp-sidebar__booking-divider" />
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Total</span>
                  <span className="adp-sidebar__booking-val" style={{ fontWeight: 800, color: 'var(--rose-deep)' }}>₹{calculatedPrice.toLocaleString()}</span>
                </div>
              </div>

              {bookingError && (
                <div className="booking-sidebar__error">
                  <AlertCircle size={14} />
                  <span>{bookingError}</span>
                </div>
              )}

              {acceptedBooking ? (
                <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #10b981', textAlign: 'center', marginBottom: 16 }}>
                  <p style={{ color: '#047857', fontWeight: 600, fontSize: '0.9rem', marginBottom: 12 }}>Your booking was approved!</p>
                  <Button onClick={() => navigate('/profile')} style={{ width: '100%', background: 'var(--success-color, #10b981)', color: '#fff', border: 'none' }}>
                    Pay Now to Confirm
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={handleBookingConfirm}
                    disabled={!isBookingReady || bookingLoading || showSuccessModal}
                    className="booking-sidebar__submit-btn"
                    style={{ width: '100%' }}
                  >
                    {bookingLoading ? (
                      <Loader2 className="spinner" size={20} />
                    ) : (
                      'Book'
                    )}
                  </Button>
                  <span className="adp-sidebar__booking-secure">
                    <Shield size={13} />
                    {isAuthenticated ? '100% secure bookings with Lume' : 'Create a free account to book'}
                  </span>
                </>
              )}
            </div>

            {/* Why Book Card */}
            <div className="adp-sidebar__why">
              <h3 className="adp-sidebar__why-title"><ShieldCheck size={20} />Why Book With Lume?</h3>
              <div className="adp-sidebar__why-list">
                <div className="adp-sidebar__why-item"><div className="adp-sidebar__why-icon"><Award size={18} /></div><div><h4>Vetted Master Artists</h4><p>Admin-verified portfolios and credentials.</p></div></div>
                <div className="adp-sidebar__why-item"><div className="adp-sidebar__why-icon"><Shield size={18} /></div><div><h4>Secure Payments</h4><p>100% secure payments via Razorpay.</p></div></div>
                <div className="adp-sidebar__why-item"><div className="adp-sidebar__why-icon"><Headphones size={18} /></div><div><h4>24/7 Support</h4><p>Dedicated concierge for your event.</p></div></div>
                <div className="adp-sidebar__why-item"><div className="adp-sidebar__why-icon"><Clock size={18} /></div><div><h4>Flexible Rescheduling</h4><p>Plans change? Reschedule with zero hassle.</p></div></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Trust Badges */}
      <section className="adp-trust">
        <div className="adp-trust__container">
          <div className="adp-trust__item"><ShieldCheck size={22} /><span>100% Verified</span></div>
          <div className="adp-trust__item"><Clock size={22} /><span>Flexible Rescheduling</span></div>
          <div className="adp-trust__item"><Lock size={22} /><span>Secure Bookings</span></div>
          <div className="adp-trust__item"><Sparkles size={22} /><span>Premium Brands</span></div>
        </div>
      </section>

      {/* Mobile Sticky Bar */}
      <div className="adp-mobile-bar">
        <div className="adp-mobile-bar__info">
          <span className="adp-mobile-bar__label">Total</span>
          <span className="adp-mobile-bar__price">₹{calculatedPrice.toLocaleString()}</span>
        </div>
        <Button variant="primary" size="lg" onClick={handleBookingConfirm}
          disabled={!isBookingReady || bookingLoading || showSuccessModal || artist.isTakingBookings === false} className="adp-mobile-bar__btn">
          {bookingLoading ? 'Processing...' : artist.isTakingBookings === false ? 'Not Taking Bookings' : isAuthenticated ? 'Confirm Booking' : 'Sign In to Book'}
        </Button>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <CheckCircle2 size={48} className="success-icon" style={{ color: 'var(--success-color, #10b981)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Booking Requested</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center' }}>
              Your booking request has been sent to the artist. We'll get back to you shortly!
            </p>
            <Button 
              variant="primary" 
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/profile');
              }}
              style={{ width: '100%' }}
            >
              View My Bookings
            </Button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ArtistDetailPage;
