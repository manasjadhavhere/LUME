import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFavorites from '../hooks/useFavorites';
import Button from '../components/ui/Button';
import { useAuth, API_BASE } from '../context/AuthContext';
import './ArtistDetailPage.css';

/* ───────────────────────── Types ───────────────────────── */

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

interface TimeSlot { time: string; available: boolean; }

interface AvailabilityData {
  availability: Array<{ date: string; timeSlots: TimeSlot[]; }>;
  defaultSchedule: Array<{ dayOfWeek: number; timeSlots: TimeSlot[]; }>;
  blockedDates: Array<{ date: string; }>;
}

interface AcceptedBooking { id: string; artistId: string; status: string; }

/* ───────────────────────── Static config ───────────────────────── */

const OCCASIONS: Record<PriceType, { label: string; icon: string }> = {
  WEDDING: { label: 'Wedding', icon: 'diamond-duotone' },
  OCCASION: { label: 'Occasion', icon: 'confetti-duotone' },
  HOURLY: { label: 'Hourly', icon: 'timer-duotone' },
};

const TRUST_ITEMS = [
  { icon: 'identification-badge-duotone', title: 'Vetted Artists', text: 'Admin-verified portfolios' },
  { icon: 'shield-check-duotone', title: 'Secure Payments', text: '100% via Razorpay' },
  { icon: 'headset-duotone', title: '24/7 Support', text: 'Dedicated concierge' },
  { icon: 'arrows-clockwise-duotone', title: 'Free Reschedule', text: 'Zero hassle changes' },
];

const GALLERY_COLLAPSED = 5;
const BIO_LIMIT = 240;

const resolveUrl = (url: string) => (url.startsWith('/') ? `${API_BASE}${url}` : url);
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const serviceIcon = (name: string) => {
  const t = name.toLowerCase();
  if (/hair|style|braid|updo/.test(t)) return 'scissors-duotone';
  if (/bridal|bride|wedding|engagement|reception|haldi|mehndi/.test(t)) return 'crown-simple-duotone';
  if (/party|glam|cocktail|sangeet|evening|event/.test(t)) return 'confetti-duotone';
  if (/shoot|editorial|photo|film|ramp|runway/.test(t)) return 'camera-duotone';
  if (/skin|facial|clean|glow/.test(t)) return 'drop-duotone';
  return 'sparkle-duotone';
};

/* ───────────────────────── Small building blocks ───────────────────────── */

type IcoColor = 'dark' | 'rose' | 'soft' | 'gold' | 'line' | 'white' | 'red' | 'green';

/** Phosphor icon (MIT) served from /public/icons/ph as a real <img>. */
const Ico: React.FC<{ n: string; c?: IcoColor; s?: number; className?: string }> = ({ n, c = 'dark', s = 18, className = '' }) => (
  <img
    className={`ap-ico ${className}`.trim()}
    src={`${import.meta.env.BASE_URL}icons/ph/${n}--${c}.svg`}
    width={s}
    height={s}
    alt=""
    aria-hidden="true"
    draggable={false}
  />
);

const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 14 }) => {
  const pct = Math.max(0, Math.min(5, value)) / 5 * 100;
  const row = (c: IcoColor) => [0, 1, 2, 3, 4].map(i => <Ico key={i} n="star-fill" c={c} s={size} />);
  return (
    <span className="ap-stars" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className="ap-stars__row">{row('line')}</span>
      <span className="ap-stars__row ap-stars__row--on" style={{ width: `${pct}%` }}>{row('gold')}</span>
    </span>
  );
};

const Step: React.FC<{ n: number; title: string; hint?: string; aside?: React.ReactNode; children: React.ReactNode }> = ({ n, title, hint, aside, children }) => (
  <div className="ap-step">
    <div className="ap-step__head">
      <span className="ap-step__n">{n}</span>
      <h3 className="ap-step__title">{title}</h3>
      {hint && <span className="ap-step__hint">{hint}</span>}
      {aside}
    </div>
    {children}
  </div>
);

const TrustList: React.FC<{ className?: string }> = ({ className = '' }) => (
  <ul className={`ap-trust ${className}`.trim()}>
    {TRUST_ITEMS.map(t => (
      <li key={t.title} className="ap-trust__item">
        <span className="ap-trust__icon"><Ico n={t.icon} c="rose" s={22} /></span>
        <span><strong>{t.title}</strong><small>{t.text}</small></span>
      </li>
    ))}
  </ul>
);

const useMedia = (query: string) => {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

/* ───────────────────────── Page ───────────────────────── */

const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isCompact = useMedia('(max-width: 1024px)');

  const [artist, setArtist] = useState<ApiArtist | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loadingArtist, setLoadingArtist] = useState(true);
  const [artistError, setArtistError] = useState('');

  const [selectedPriceType, setSelectedPriceType] = useState<PriceType>('OCCASION');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [acceptedBooking, setAcceptedBooking] = useState<AcceptedBooking | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('ap-portfolio');
  const [shareMsg, setShareMsg] = useState('');

  const dateStripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  /* ── Data ── */
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
    if (isAuthenticated && user?.role === 'CLIENT' && artist?.id) {
      fetch(`${API_BASE}/api/clients/me/bookings`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const b = data.data.find((x: AcceptedBooking) => x.artistId === artist.id && x.status === 'ACCEPTED');
            if (b) setAcceptedBooking(b);
          }
        }).catch(() => { });
    }
  }, [isAuthenticated, user, artist?.id, token]);

  const portfolio = useMemo(() => (artist?.portfolioUrls ?? []).map(resolveUrl), [artist]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !availability) return [];
    if (availability.blockedDates.some(b => b.date.startsWith(selectedDate))) return [];
    const override = availability.availability.find(a => a.date.startsWith(selectedDate));
    if (override) return override.timeSlots.filter(s => s.available).map(s => s.time);
    const dow = new Date(selectedDate + 'T00:00:00').getDay();
    const def = availability.defaultSchedule.find(d => d.dayOfWeek === dow);
    return def ? def.timeSlots.filter(s => s.available).map(s => s.time) : [];
  }, [selectedDate, availability]);

  const upcomingDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const calculatedPrice = useMemo(() => {
    if (!artist) return 0;
    if (selectedPriceType === 'WEDDING') return artist.weddingPrice || 0;
    if (selectedPriceType === 'OCCASION') return artist.occasionPrice || 0;
    if (selectedPriceType === 'HOURLY' && selectedTimeSlots.length > 0) return (artist.hourlyPrice || 0) * selectedTimeSlots.length;
    return artist.startingPrice || 0;
  }, [artist, selectedPriceType, selectedTimeSlots]);

  const isBookingReady = !!selectedDate && selectedTimeSlots.length > 0;

  const handleBookingConfirm = useCallback(async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isBookingReady || !artist || bookingLoading || showSuccessModal) return;
    setBookingLoading(true); setBookingError('');
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ artistId: artist.id, serviceId: selectedServiceId || undefined, date: selectedDate, time: selectedTimeSlots.join(', '), priceType: selectedPriceType, notes, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setSheetOpen(false);
      setShowSuccessModal(true);
    } catch (err) { setBookingError(err instanceof Error ? err.message : 'Booking failed.'); }
    finally { setBookingLoading(false); }
  }, [isAuthenticated, isBookingReady, artist, bookingLoading, showSuccessModal, token, selectedServiceId, selectedDate, selectedTimeSlots, selectedPriceType, notes, address, navigate]);

  const ratingDistribution = useMemo(() => {
    if (!artist?.reviews?.length) return [0, 0, 0, 0, 0];
    const dist = [0, 0, 0, 0, 0];
    artist.reviews.forEach(r => { const b = Math.min(Math.floor(r.rating), 5) - 1; if (b >= 0) dist[b]++; });
    return dist;
  }, [artist]);

  /* ── Scroll-spy for the section tabs ── */
  useEffect(() => {
    if (!artist) return;
    const els = ['ap-portfolio', 'ap-services', 'ap-about', 'ap-reviews']
      .map(sid => document.getElementById(sid))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: '-25% 0px -65% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [artist]);

  /* ── Keyboard: Esc closes overlays, arrows move in the lightbox ── */
  const photoCount = portfolio.length;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightboxIndex(null); setSheetOpen(false); }
      if (lightboxIndex !== null && lightboxIndex >= 0 && photoCount > 1) {
        if (e.key === 'ArrowRight') setLightboxIndex(p => (p === null ? p : (p + 1) % photoCount));
        if (e.key === 'ArrowLeft') setLightboxIndex(p => (p === null ? p : (p - 1 + photoCount) % photoCount));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, photoCount]);

  /* ── Lock page scroll behind overlays ── */
  const lockScroll = lightboxIndex !== null || (sheetOpen && isCompact);
  useEffect(() => {
    if (!lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [lockScroll]);

  /* ───────────── Render: loading / error ───────────── */

  if (loadingArtist) return (
    <div className="ap" aria-busy="true" aria-label="Loading artist profile">
      <div className="ap-wrap">
        <div className="ap-skel ap-skel--bar" />
        <div className="ap-skel-hero">
          <div className="ap-skel ap-skel--avatar" />
          <div className="ap-skel-lines">
            <div className="ap-skel ap-skel--line ap-skel--w60" />
            <div className="ap-skel ap-skel--line ap-skel--w40" />
            <div className="ap-skel ap-skel--line ap-skel--w50" />
          </div>
        </div>
        <div className="ap-skel-grid">
          <div className="ap-skel-photos">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="ap-skel ap-skel--photo" />)}</div>
          <div className="ap-skel ap-skel--card" />
        </div>
      </div>
    </div>
  );

  if (artistError || !artist) return (
    <div className="ap-state">
      <span className="ap-state__icon"><Ico n="warning-circle" c="red" s={32} /></span>
      <h2>Artist not found</h2>
      <p>The artist you're looking for doesn't exist or has been removed.</p>
      <Button onClick={() => navigate('/discover')}>Browse Artists</Button>
    </div>
  );

  /* ───────────── Derived view data ───────────── */

  const firstName = artist.user.name.trim().split(' ')[0];
  const avatar = artist.profileImageUrl
    ? resolveUrl(artist.profileImageUrl)
    : (artist.user.avatarUrl ? resolveUrl(artist.user.avatarUrl) : null);

  const priceTypes: PriceType[] = [];
  if (artist.weddingPrice) priceTypes.push('WEDDING');
  if (artist.occasionPrice) priceTypes.push('OCCASION');
  if (artist.hourlyPrice) priceTypes.push('HOURLY');
  const priceOf: Record<PriceType, number> = {
    WEDDING: artist.weddingPrice || 0,
    OCCASION: artist.occasionPrice || 0,
    HOURLY: artist.hourlyPrice || 0,
  };

  const bioText = (artist.bio || `Specializing in ${artist.specialties.slice(0, 2).map(s => s.toLowerCase()).join(' & ')} makeup with over ${artist.experience} years of professional experience. Known for creating flawless, personalized looks that enhance natural beauty for every occasion.`).trim();
  const bioLong = bioText.length > BIO_LIMIT;
  const bioShown = bioExpanded || !bioLong ? bioText : `${bioText.slice(0, BIO_LIMIT).replace(/\s+\S*$/, '')}…`;

  const hasReviews = artist.reviewCount > 0;
  const certification = artist.certification?.trim();
  const showBadge = !!artist.badge && artist.badge.toUpperCase() !== 'VERIFIED';
  const takingBookings = artist.isTakingBookings !== false;
  const instagramHref = artist.instagramUrl
    ? (artist.instagramUrl.startsWith('http') ? artist.instagramUrl : `https://instagram.com/${artist.instagramUrl.replace('@', '')}`)
    : null;

  const visiblePhotos = portfolio.slice(0, GALLERY_COLLAPSED);

  const tabs = [
    { id: 'ap-portfolio', label: 'Portfolio' },
    { id: 'ap-about', label: 'About' },
    { id: 'ap-reviews', label: `Reviews${hasReviews ? ` (${artist.reviewCount})` : ''}` },
  ];

  const goTo = (sid: string) => {
    setActiveSection(sid);
    document.getElementById(sid)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/discover'));

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: `${artist.user.name} on Lume`, url }); return; }
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied');
      window.setTimeout(() => setShareMsg(''), 2200);
    } catch { /* share dismissed */ }
  };

  const slotCountFor = (ds: string) => {
    const d = new Date(ds + 'T00:00:00');
    const ov = availability?.availability.find(a => a.date.startsWith(ds));
    if (ov) return ov.timeSlots.filter(s => s.available).length;
    const def = availability?.defaultSchedule.find(x => x.dayOfWeek === d.getDay());
    return def ? def.timeSlots.filter(s => s.available).length : 0;
  };

  const monthLabel = (() => {
    const a = new Date(upcomingDates[0] + 'T00:00:00');
    const b = new Date(upcomingDates[upcomingDates.length - 1] + 'T00:00:00');
    const mo = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short' });
    return a.getMonth() === b.getMonth() ? `${mo(a)} ${a.getFullYear()}` : `${mo(a)} – ${mo(b)} ${b.getFullYear()}`;
  })();

  const selectedService = artist.services.find(s => s.id === selectedServiceId);
  const occasionLabel = priceTypes.length ? OCCASIONS[selectedPriceType].label : 'Starting from';

  let stepNo = 0;
  const stepOccasion = priceTypes.length ? ++stepNo : 0;
  const stepService = artist.services.length ? ++stepNo : 0;
  const stepDate = ++stepNo;
  const stepTime = ++stepNo;
  const stepDetails = ++stepNo;

  const scrollDates = (dir: 1 | -1) => dateStripRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });

  const ctaHint = !selectedDate ? 'Choose a date to continue' : selectedTimeSlots.length === 0 ? 'Pick at least one time slot' : '';

  return (
    <div className="ap">
      <div className="ap-wrap">

        {/* ══════ Top bar ══════ */}
        <div className="ap-topbar">
          <button type="button" className="ap-back" onClick={handleBack} aria-label="Go back">
            <Ico n="arrow-left" s={18} /><span>Back</span>
          </button>
          <nav className="ap-crumbs" aria-label="Breadcrumb">
            <button type="button" onClick={() => navigate('/discover')}>Discover</button>
            <Ico n="caret-right" c="soft" s={12} />
            <span aria-current="page">{artist.user.name}</span>
          </nav>
          <div className="ap-topbar__actions">
            <button type="button" className={`ap-action ${isFavorite(artist.id) ? 'is-on' : ''}`} onClick={() => toggleFavorite(artist.id)} aria-pressed={isFavorite(artist.id)} aria-label={isFavorite(artist.id) ? 'Remove from saved' : 'Save artist'}>
              <Ico n={isFavorite(artist.id) ? 'heart-fill' : 'heart'} c={isFavorite(artist.id) ? 'rose' : 'dark'} s={18} />
              <span>{isFavorite(artist.id) ? 'Saved' : 'Save'}</span>
            </button>
            <button type="button" className="ap-action" onClick={handleShare} aria-label="Share artist">
              <Ico n="share-network" s={18} />
              <span>{shareMsg || 'Share'}</span>
            </button>
          </div>
        </div>

        {/* ══════ Two-column layout: profile (left) · booking (right) ══════ */}
        <div className="ap-grid">
          <main className="ap-main">

        {/* ══════ Identity ══════ */}
        <header className="ap-hero">
          <button type="button" className="ap-hero__avatar" onClick={() => avatar && setLightboxIndex(-1)} aria-label={`View ${artist.user.name}'s photo`} disabled={!avatar}>
            {avatar ? <img src={avatar} alt={artist.user.name} /> : <span>{artist.user.name.charAt(0).toUpperCase()}</span>}
          </button>

          <div className="ap-hero__body">
            <div className="ap-hero__title">
              <h1>{artist.user.name}</h1>
              {artist.isVerified && <span className="ap-hero__seal" title="Verified by Lume"><Ico n="seal-check-fill" c="rose" s={22} /><span className="ap-sr">Verified by Lume</span></span>}
              {showBadge && <span className="ap-badge">{artist.badge}</span>}
            </div>

            {certification && (
              <p className="ap-hero__cert"><Ico n="graduation-cap" c="soft" s={16} />{certification}</p>
            )}

            <ul className="ap-hero__meta">
              <li><Ico n="map-pin" c="soft" s={16} />{artist.location}</li>
              <li>
                {hasReviews ? (
                  <button type="button" className="ap-hero__rating" onClick={() => goTo('ap-reviews')}>
                    <Ico n="star-fill" c="gold" s={16} /><strong>{artist.rating.toFixed(1)}</strong><span>({artist.reviewCount})</span>
                  </button>
                ) : <span className="ap-tag-new">New on Lume</span>}
              </li>
              <li><Ico n="briefcase" c="soft" s={16} />{artist.experience}+ yrs experience</li>
            </ul>

            <div className="ap-hero__foot">
              <span className={`ap-status ${takingBookings ? 'is-open' : 'is-closed'}`}>
                <i aria-hidden="true" />{takingBookings ? 'Taking bookings' : 'Not taking bookings'}
              </span>
              {artist.specialties.length > 0 && (
                <div className="ap-hero__tags">
                  {artist.specialties.slice(0, 3).join(' · ')}
                  {artist.specialties.length > 3 && (
                    <button type="button" onClick={() => goTo('ap-about')}> +{artist.specialties.length - 3} more</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ══════ Metrics ══════ */}
        <ul className="ap-metrics">
          <li><Ico n="medal-duotone" c="rose" s={28} /><span><strong>{artist.experience}+</strong><small>Years experience</small></span></li>
          <li><Ico n="calendar-check-duotone" c="rose" s={28} /><span><strong>{artist.bookingCount}{artist.bookingCount > 0 ? '+' : ''}</strong><small>Bookings</small></span></li>
          <li><Ico n="star-duotone" c="rose" s={28} /><span><strong>{hasReviews ? artist.rating.toFixed(1) : 'New'}</strong><small>{hasReviews ? 'Average rating' : 'No reviews yet'}</small></span></li>
          {artist.isVerified && <li><Ico n="seal-check-duotone" c="rose" s={28} /><span><strong>Verified</strong><small>by Lume</small></span></li>}
        </ul>

            <nav className="ap-tabs" aria-label="Profile sections">
              {tabs.map(t => (
                <button key={t.id} type="button" className={activeSection === t.id ? 'is-on' : ''} aria-current={activeSection === t.id ? 'true' : undefined} onClick={() => goTo(t.id)}>
                  {t.label}
                </button>
              ))}
            </nav>

            {/* Portfolio */}
            <section id="ap-portfolio" className="ap-sec">
              <div className="ap-sec__head">
                <h2>Portfolio</h2>
                {portfolio.length > 0 && <span className="ap-sec__meta">{portfolio.length} {portfolio.length === 1 ? 'photo' : 'photos'}</span>}
              </div>

              {portfolio.length > 0 ? (
                <>
                  <div className="ap-gal">
                    {visiblePhotos.map((src, i) => {
                      const isLast = i === 4;
                      const remaining = portfolio.length - 5;
                      return (
                        <button key={src + i} type="button" className="ap-tile" onClick={() => setLightboxIndex(i)} aria-label={`Open photo ${i + 1} of ${portfolio.length}`}>
                          <img src={src} alt={`${artist.user.name} — portfolio ${i + 1}`} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" />
                          {isLast && remaining > 0 && (
                            <span className="ap-tile__count"><Ico n="images" c="white" s={16} />+{remaining} photos</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="ap-empty">
                  <Ico n="images-duotone" c="rose" s={36} />
                  <strong>Portfolio coming soon</strong>
                  <span>{firstName} hasn't added work samples yet.</span>
                </div>
              )}
            </section>



            {/* About */}
            <section id="ap-about" className="ap-sec">
              <div className="ap-sec__head"><h2>About {firstName}</h2></div>
              <p className="ap-about__bio">{bioShown}</p>
              {bioLong && (
                <button type="button" className="ap-link" onClick={() => setBioExpanded(v => !v)}>
                  {bioExpanded ? 'Show less' : 'Read more'}
                  <Ico n="caret-down" s={14} className={bioExpanded ? 'is-flipped' : ''} />
                </button>
              )}

              <dl className="ap-facts">
                {certification && <div><dt><Ico n="graduation-cap" c="soft" s={18} />Certification</dt><dd>{certification}</dd></div>}
                <div><dt><Ico n="briefcase" c="soft" s={18} />Experience</dt><dd>{artist.experience}+ years</dd></div>
                <div><dt><Ico n="map-pin" c="soft" s={18} />Based in</dt><dd>{artist.location}</dd></div>
                {instagramHref && (
                  <div><dt><Ico n="instagram-logo" c="rose" s={18} />Instagram</dt><dd><a href={instagramHref} target="_blank" rel="noopener noreferrer">View profile</a></dd></div>
                )}
              </dl>

              {artist.specialties.length > 0 && (
                <div className="ap-specs">
                  <h3>Specialties</h3>
                  <ul>{artist.specialties.map(s => <li key={s}>{s}</li>)}</ul>
                </div>
              )}
            </section>

            {/* Reviews */}
            <section id="ap-reviews" className="ap-sec">
              <div className="ap-sec__head">
                <h2>Reviews &amp; Ratings</h2>
                {hasReviews && <span className="ap-sec__meta">{artist.reviewCount} review{artist.reviewCount !== 1 ? 's' : ''}</span>}
              </div>

              {hasReviews || (artist.reviews && artist.reviews.length > 0) ? (
                <div className="ap-rsum">
                  <div className="ap-rsum__score">
                    <strong>{artist.rating.toFixed(1)}</strong>
                    <Stars value={artist.rating} size={16} />
                    <small>{artist.reviewCount} review{artist.reviewCount !== 1 ? 's' : ''}</small>
                  </div>
                  <div className="ap-rsum__bars">
                    {[5, 4, 3, 2, 1].map(s => {
                      const c = ratingDistribution[s - 1];
                      const p = artist.reviews?.length ? (c / artist.reviews.length) * 100 : 0;
                      return (
                        <div key={s} className="ap-rbar">
                          <span>{s}<Ico n="star-fill" c="gold" s={11} /></span>
                          <div className="ap-rbar__track"><div style={{ width: `${p}%` }} /></div>
                          <span>{c}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="ap-empty ap-empty--reviews">
                  <Ico n="star-duotone" c="rose" s={36} />
                  <strong>No reviews yet</strong>
                  <span>Be the first to book and share your experience.</span>
                </div>
              )}

              {artist.reviews && artist.reviews.length > 0 && (
                  <ul className="ap-rlist">
                    {(showAllReviews ? artist.reviews : artist.reviews.slice(0, 3)).map(r => (
                      <li key={r.id} className="ap-review">
                        <div className="ap-review__top">
                          <span className="ap-review__avatar">{(r.client?.name || 'A').charAt(0).toUpperCase()}</span>
                          <div className="ap-review__who">
                            <strong>{r.client?.name || 'Anonymous'}</strong>
                            <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</time>
                          </div>
                          <Stars value={r.rating} size={13} />
                        </div>
                        <p>{r.comment}</p>
                      </li>
                    ))}
                  </ul>
                )}
              {artist.reviews && artist.reviews.length > 3 && (
                <button type="button" className="ap-more" onClick={() => setShowAllReviews(v => !v)}>
                  {showAllReviews ? 'Show fewer reviews' : `Show all ${artist.reviews.length} reviews`}
                  <Ico n="caret-down" s={14} className={showAllReviews ? 'is-flipped' : ''} />
                </button>
              )}
            </section>

            {/* Trust — inline on small screens (the booking card hosts it on desktop) */}
            <TrustList className="ap-trust--inline" />
          </main>

          {/* ───── Right: booking ───── */}
          {isCompact && sheetOpen && <div className="ap-backdrop" onClick={() => setSheetOpen(false)} aria-hidden="true" />}
          <aside
            className={`ap-aside ${sheetOpen ? 'is-open' : ''}`}
            role={isCompact ? 'dialog' : undefined}
            aria-modal={isCompact ? true : undefined}
            aria-label={`Book ${artist.user.name}`}
          >
            <div className="ap-sheet__bar">
              <span className="ap-sheet__grab" aria-hidden="true" />
              <strong>Book {firstName}</strong>
              <button type="button" className="ap-sheet__close" onClick={() => setSheetOpen(false)} aria-label="Close booking panel">
                <Ico n="x" s={18} />
              </button>
            </div>

            <div className="ap-book">
              <div className="ap-book__head">
                <div>
                  <span className="ap-book__eyebrow">{occasionLabel}</span>
                  <div className="ap-book__price">
                    <strong>{inr(calculatedPrice)}</strong>
                    <small>+ GST{selectedPriceType === 'HOURLY' && priceTypes.length > 0 ? ' / hour' : ''}</small>
                  </div>
                </div>
                {hasReviews && (
                  <button type="button" className="ap-book__rating" onClick={() => { setSheetOpen(false); goTo('ap-reviews'); }}>
                    <Ico n="star-fill" c="gold" s={15} /><strong>{artist.rating.toFixed(1)}</strong><span>({artist.reviewCount})</span>
                  </button>
                )}
              </div>

              {priceTypes.length > 0 && (
                <Step n={stepOccasion} title="Occasion">
                  <div className="ap-occ" role="radiogroup" aria-label="Occasion" style={{ ['--cols' as string]: priceTypes.length }}>
                    {priceTypes.map(pt => (
                      <button key={pt} type="button" role="radio" aria-checked={selectedPriceType === pt}
                        className={selectedPriceType === pt ? 'is-on' : ''}
                        onClick={() => { setSelectedPriceType(pt); setSelectedServiceId(null); }}>
                        <Ico n={OCCASIONS[pt].icon} c="rose" s={26} />
                        <strong>{OCCASIONS[pt].label}</strong>
                        <span>{inr(priceOf[pt])}{pt === 'HOURLY' ? '/hr' : ''}</span>
                      </button>
                    ))}
                  </div>
                </Step>
              )}

              {artist.services.length > 0 && (
                <Step n={stepService} title="Service" hint="Optional">
                  <div className="ap-chips">
                    {artist.services.map(s => (
                      <button key={s.id} type="button" aria-pressed={selectedServiceId === s.id}
                        className={selectedServiceId === s.id ? 'is-on' : ''}
                        onClick={() => setSelectedServiceId(selectedServiceId === s.id ? null : s.id)}>
                        <Ico n={serviceIcon(s.name)} c="rose" s={16} />
                        {s.name}<em>{inr(s.price)}</em>
                      </button>
                    ))}
                  </div>
                </Step>
              )}

              <Step n={stepDate} title="Date" hint={monthLabel} aside={
                <span className="ap-step__nav">
                  <button type="button" onClick={() => scrollDates(-1)} aria-label="Earlier dates"><Ico n="caret-left" s={14} /></button>
                  <button type="button" onClick={() => scrollDates(1)} aria-label="Later dates"><Ico n="caret-right" s={14} /></button>
                </span>
              }>
                <div className="ap-dates" ref={dateStripRef} role="listbox" aria-label="Choose a date">
                  {upcomingDates.map(ds => {
                    const d = new Date(ds + 'T00:00:00');
                    const blocked = !!availability?.blockedDates.some(b => b.date.startsWith(ds));
                    const slots = slotCountFor(ds);
                    const off = blocked || slots === 0;
                    return (
                      <button key={ds} type="button" role="option" aria-selected={selectedDate === ds} disabled={off}
                        aria-label={d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        className={selectedDate === ds ? 'is-on' : ''}
                        onClick={() => { setSelectedDate(ds); setSelectedTimeSlots([]); }}>
                        <small>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</small>
                        <strong>{d.getDate()}</strong>
                        <em>{blocked ? 'Off' : slots > 0 ? `${slots} slot${slots > 1 ? 's' : ''}` : 'Full'}</em>
                      </button>
                    );
                  })}
                </div>
              </Step>

              {selectedDate && (
                <Step n={stepTime} title="Time" hint={artist.hourlyPrice && selectedPriceType === 'HOURLY' ? 'Pick one or more hours' : 'Pick a slot'}>
                  {availableSlots.length === 0
                    ? <p className="ap-book__empty">No slots available for this date.</p>
                    : (
                      <div className="ap-times">
                        {availableSlots.map(slot => {
                          const h = parseInt(slot.split(':')[0]);
                          const end = `${(h + 1).toString().padStart(2, '0')}:00`;
                          const on = selectedTimeSlots.includes(slot);
                          return (
                            <button key={slot} type="button" aria-pressed={on} className={on ? 'is-on' : ''}
                              onClick={() => on ? setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot)) : setSelectedTimeSlots([...selectedTimeSlots, slot])}>
                              {slot} – {end}
                            </button>
                          );
                        })}
                      </div>
                    )}
                </Step>
              )}

              {isBookingReady && (
                <Step n={stepDetails} title="Details" hint="Optional">
                  <label className="ap-field">
                    <Ico n="map-pin" c="soft" s={18} />
                    <input type="text" placeholder="Event venue / address" value={address} onChange={e => setAddress(e.target.value)} />
                  </label>
                  <textarea className="ap-field ap-field--area" placeholder="Special requests or notes…" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
                </Step>
              )}

              {selectedDate && (
                <dl className="ap-sum">
                  <div><dt>Occasion</dt><dd>{priceTypes.length ? OCCASIONS[selectedPriceType].label : '—'}</dd></div>
                  {selectedService && <div><dt>Service</dt><dd>{selectedService.name}</dd></div>}
                  <div><dt>Date</dt><dd>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</dd></div>
                  <div><dt>Time</dt><dd>{selectedTimeSlots.length > 0 ? selectedTimeSlots.join(', ') : '—'}</dd></div>
                  <div className="ap-sum__total"><dt>Total</dt><dd>{inr(calculatedPrice)} <small>+ GST</small></dd></div>
                </dl>
              )}

              {bookingError && <div className="ap-alert" role="alert"><Ico n="warning-circle" c="red" s={18} />{bookingError}</div>}

              {acceptedBooking ? (
                <div className="ap-paynow">
                  <p>Your booking was approved!</p>
                  <button type="button" className="ap-cta ap-cta--pay" onClick={() => navigate('/profile')}>Pay Now to Confirm</button>
                </div>
              ) : (
                <>
                  <button type="button" className="ap-cta" disabled={!isBookingReady || bookingLoading || showSuccessModal} onClick={handleBookingConfirm}>
                    {bookingLoading ? <span className="ap-spinner" aria-label="Booking in progress" /> : 'Reserve'}
                  </button>
                  {ctaHint && <p className="ap-cta__hint">{ctaHint}</p>}
                </>
              )}
              <p className="ap-book__note">
                <Ico n="lock-key" c="soft" s={15} />
                {isAuthenticated ? 'Secure booking · No payment now' : 'Create a free account to book'}
              </p>
            </div>

            <TrustList className="ap-trust--card" />
          </aside>
        </div>
      </div>

      {/* ══════ Mobile booking bar ══════ */}
      <div className="ap-mbar">
        <div>
          <small>{occasionLabel}</small>
          <strong>{inr(calculatedPrice)}<em> + GST</em></strong>
        </div>
        <button type="button" className="ap-mbar__cta" onClick={() => setSheetOpen(true)}>Reserve</button>
      </div>

      {/* ══════ Success modal ══════ */}
      {showSuccessModal && (
        <div className="ap-overlay" onClick={() => { setShowSuccessModal(false); navigate('/profile'); }}>
          <div className="ap-modal" role="dialog" aria-modal="true" aria-label="Booking requested" onClick={e => e.stopPropagation()}>
            <span className="ap-modal__icon"><Ico n="check-circle-fill" c="green" s={56} /></span>
            <h2>Booking Requested!</h2>
            <p>Your request has been sent. The artist will confirm shortly.</p>
            <Button variant="primary" onClick={() => { setShowSuccessModal(false); navigate('/profile'); }} style={{ width: '100%' }}>View My Bookings</Button>
          </div>
        </div>
      )}

      {/* ══════ Lightbox ══════ */}
      {lightboxIndex !== null && (
        <div
          className="ap-lb"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null || lightboxIndex < 0 || photoCount < 2) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) < 50) return;
            setLightboxIndex(p => (p === null ? p : dx < 0 ? (p + 1) % photoCount : (p - 1 + photoCount) % photoCount));
          }}
        >
          <button type="button" className="ap-lb__x" onClick={() => setLightboxIndex(null)} aria-label="Close viewer"><Ico n="x" c="white" s={22} /></button>
          {lightboxIndex === -1 && avatar ? (
            <img src={avatar} alt={artist.user.name} className="ap-lb__img ap-lb__img--avatar" onClick={e => e.stopPropagation()} />
          ) : photoCount > 0 && lightboxIndex >= 0 ? (
            <>
              {photoCount > 1 && (
                <button type="button" className="ap-lb__arr ap-lb__arr--l" aria-label="Previous photo"
                  onClick={e => { e.stopPropagation(); setLightboxIndex(p => (p === null ? p : (p - 1 + photoCount) % photoCount)); }}>
                  <Ico n="caret-left" c="white" s={22} />
                </button>
              )}
              <img src={portfolio[lightboxIndex]} alt={`${artist.user.name} — portfolio ${lightboxIndex + 1}`} className="ap-lb__img" onClick={e => e.stopPropagation()} />
              {photoCount > 1 && (
                <button type="button" className="ap-lb__arr ap-lb__arr--r" aria-label="Next photo"
                  onClick={e => { e.stopPropagation(); setLightboxIndex(p => (p === null ? p : (p + 1) % photoCount)); }}>
                  <Ico n="caret-right" c="white" s={22} />
                </button>
              )}
              <span className="ap-lb__ct">{lightboxIndex + 1} / {photoCount}</span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ArtistDetailPage;
