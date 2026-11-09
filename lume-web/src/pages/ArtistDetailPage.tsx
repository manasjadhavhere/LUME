import { useScrollLock } from '../hooks/useScrollLock';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFavorites from '../hooks/useFavorites';
import Button from '../components/ui/Button';
import type { ClientSavedAddress } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import { useAuth, API_BASE } from '../context/AuthContext';
import { getArtistSlug } from '../utils/slug';
import BookingLocationModal from '../components/booking/BookingLocationModal';
import { bookingIntervals, formatSavedAddressLine, formatSlotMinutes, hasBookingDateTimePassed, hasExactGeoAddress, parseSlotMinutes } from '../utils/bookingTime';
import './ArtistDetailPage.css';

/* ───────────────────────── Types ───────────────────────── */

type PriceType = 'WEDDING' | 'OCCASION' | 'HOURLY';

interface ApiArtist {
  id: string;
  slug?: string;
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
  id: string; rating: number; text?: string; comment?: string; createdAt: string;
  client: { name: string; avatarUrl?: string; };
}

interface TimeSlot { time: string; available: boolean; }

interface AvailabilityData {
  availability: Array<{ date: string; timeSlots: TimeSlot[]; }>;
  defaultSchedule: Array<{ dayOfWeek: number; timeSlots: TimeSlot[]; }>;
  bookedSlots?: Array<{ date: string; start: number; end: number }>;
  blockedDates: Array<{ date: string; }>;
}

interface ClientReservation { date: string; time: string; endTime?: string | null; id: string; artistId: string; status: string; artist?: { id: string }; }

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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
  const [matches, setMatches] = useState(() => 
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
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
  const [venue, setVenue] = useState<ClientSavedAddress | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reservations, setReservations] = useState<ClientReservation[]>([]);
  const [revision, setRevision] = useState(0);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('ap-portfolio');
  const [shareMsg, setShareMsg] = useState('');

  const dateStripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  /* ── Data ── */
  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoadingArtist(true);
    setArtistError('');
    setArtist(null);
    setAvailability(null);
    setReservations([]);
    setVenue(null);
    setSelectedServiceId(null);
    setSelectedDate(null);
    setSelectedTimeSlots([]);
    setBookingError('');
    setShowSuccessModal(false);
    window.scrollTo(0, 0);
    Promise.all([
      fetch(`${API_BASE}/api/artists/${id}`).then(r => r.json()),
      fetch(`${API_BASE}/api/artists/${id}/availability?fromDate=${dateKey(new Date())}&toDate=${dateKey(new Date(Date.now() + 30 * 86400000))}`).then(r => r.json()),
    ]).then(([artistRes, availRes]) => {
      if (!active) return;
      if (artistRes.success) {
        setArtist(artistRes.data);
        const profile: ApiArtist = artistRes.data;
        setSelectedPriceType(profile.occasionPrice ? 'OCCASION' : profile.weddingPrice ? 'WEDDING' : 'HOURLY');
        const targetSlug = artistRes.data.slug || getArtistSlug(artistRes.data.user?.name, artistRes.data.id);
        if (targetSlug && id !== targetSlug) {
          window.history.replaceState(null, '', `/artist/${targetSlug}`);
        }
      } else {
        setArtistError('Artist not found');
      }
      if (availRes.success) setAvailability(availRes.data);
    }).catch(() => { if (active) setArtistError('Failed to load artist'); })
      .finally(() => { if (active) setLoadingArtist(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    setVenue(null);
    setReservations([]);
  }, [user?.id]);

  useEffect(() => {
    if (!artist?.id) return;
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/artists/${artist.id}/availability?fromDate=${dateKey(new Date())}&toDate=${dateKey(new Date(Date.now() + 30 * 86400000))}`, { signal: controller.signal });
        const json = await res.json();
        if (!controller.signal.aborted && json.success) setAvailability(json.data);
      } catch { /* Keep the last loaded calendar. The API rechecks every reservation. */ }
    };
    const refreshOwn = async () => {
      if (user?.role !== 'CLIENT' || !token) return;
      try {
        const res = await fetch(`${API_BASE}/api/bookings`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        const json = await res.json();
        if (!controller.signal.aborted && json.success) setReservations(json.data.filter((b: ClientReservation) =>
          (b.artistId === artist.id || b.artist?.id === artist.id) &&
          ['PENDING', 'ACCEPTED', 'PARTIALLY_PAID', 'CONFIRMED'].includes(b.status) && !hasBookingDateTimePassed(b)));
      } catch { /* Another refresh runs when the window regains focus. */ }
    };
    const refreshReviews = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/reviews/artist/${artist.id}`, { signal: controller.signal });
        if (!response.ok) return;
        const body = await response.json();
        const reviews: ReviewItem[] = body.data?.reviews;
        if (controller.signal.aborted || !Array.isArray(reviews)) return;
        const rating = reviews.length ? reviews.reduce((total, r) => total + r.rating, 0) / reviews.length : 0;
        setArtist(current => current?.id === artist.id ? { ...current, reviews, rating, reviewCount: reviews.length } : current);
      } catch { /* The artist response already includes recent reviews. */ }
    };
    const reload = () => { if (!document.hidden) { void refresh(); void refreshOwn(); void refreshReviews(); } };
    void refreshReviews();
    if (revision) void refresh();
    void refreshOwn();
    const timer = window.setInterval(reload, 30000);
    window.addEventListener('focus', reload);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener('focus', reload); };
  }, [artist?.id, user?.role, token, revision]);

  const portfolio = useMemo(() => (artist?.portfolioUrls ?? []).map(resolveUrl), [artist]);
  const serviceDuration = artist?.services.find(s => s.id === selectedServiceId)?.duration ?? 60;
  const slotsFor = (day: string) => {
    const override = availability?.availability.find(a => a.date.startsWith(day));
    const weekly = availability?.defaultSchedule.find(d => d.dayOfWeek === new Date(day + 'T00:00:00Z').getUTCDay());
    const schedule = (override ?? weekly)?.timeSlots.filter(s => s.available) ?? [];
    const occupied = availability?.bookedSlots?.filter(b => b.date === day) ?? [];
    const mine = reservations.filter(b => b.date.startsWith(day)).flatMap(bookingIntervals);
    const starts = new Set(schedule.map(s => parseSlotMinutes(s.time)));
    const times = new Map(schedule.map(s => [parseSlotMinutes(s.time), s.time]));
    for (const { start, end } of occupied) {
      for (let t = start; t < end; t += 60) if (!times.has(t)) times.set(t, formatSlotMinutes(t));
    }
    return [...times.values()].sort((a, b) => (parseSlotMinutes(a) ?? 0) - (parseSlotMinutes(b) ?? 0)).map(time => {
      const start = parseSlotMinutes(time) ?? 0;
      const end = start + serviceDuration;
      const overlaps = (b: { start: number; end: number }) => start < b.end && b.start < end;
      const own = mine.some(overlaps);
      const booked = occupied.some(overlaps) || own;
      let available = !booked && end <= 1440 && !availability?.blockedDates.some(b => b.date.startsWith(day));
      for (let t = start; t < end; t += 60) available = available && starts.has(t);
      return { time, end, own, booked, available };
    });
  };
  const daySlots = selectedDate ? slotsFor(selectedDate) : [];

  const invalidSelection = selectedTimeSlots.some(t => !daySlots.some(s => s.time === t && s.available));
  useEffect(() => {
    if (invalidSelection) setSelectedTimeSlots([]);
  }, [invalidSelection]);

  const upcomingDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      dates.push(dateKey(d));
    }
    return dates;
  }, []);

  const calculatedPrice = useMemo(() => {
    if (!artist) return 0;
    if (selectedServiceId) {
      const s = artist.services?.find(srv => srv.id === selectedServiceId);
      if (s) return s.price;
    }
    if (selectedPriceType === 'WEDDING') return artist.weddingPrice || 0;
    if (selectedPriceType === 'OCCASION') return artist.occasionPrice || 0;
    if (selectedPriceType === 'HOURLY') return (artist.hourlyPrice || 0) * Math.max(1, selectedTimeSlots.length);
    return 0;
  }, [artist, selectedServiceId, selectedPriceType, selectedTimeSlots]);

  const isBookingReady = !!selectedDate && selectedTimeSlots.length > 0 && calculatedPrice > 0
    && selectedTimeSlots.every(t => daySlots.some(s => s.time === t && s.available))
    && !!artist?.isVerified && artist.isTakingBookings !== false;

  const handleBookingConfirm = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isBookingReady || !artist || bookingLoading || showSuccessModal) return;
    if (!hasExactGeoAddress(venue)) { setShowLocationModal(true); return; }
    setBookingLoading(true); setBookingError('');
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          artistId: artist.id,
          serviceId: selectedServiceId || undefined,
          date: selectedDate,
          time: selectedTimeSlots.join(', '),
          priceType: selectedPriceType,
          notes,
          address: formatSavedAddressLine(venue),
          latitude: venue.lat,
          longitude: venue.lng,
        }),
      });
      const data = await res.json();
      if (res.status === 409) setRevision(v => v + 1);
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setRevision(v => v + 1);
      setSheetOpen(false);
      setShowSuccessModal(true);
    } catch (err) { setBookingError(err instanceof Error ? err.message : 'Booking failed.'); }
    finally { setBookingLoading(false); }
  };

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
      if (e.key === 'Escape' && !showLocationModal) { setLightboxIndex(null); setSheetOpen(false); }
      if (lightboxIndex !== null && lightboxIndex >= 0 && photoCount > 1) {
        if (e.key === 'ArrowRight') setLightboxIndex(p => (p === null ? p : (p + 1) % photoCount));
        if (e.key === 'ArrowLeft') setLightboxIndex(p => (p === null ? p : (p - 1 + photoCount) % photoCount));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, photoCount, showLocationModal]);

  /* ── Lock page scroll behind overlays ── */
  useScrollLock(lightboxIndex !== null || (sheetOpen && isCompact) || showSuccessModal);

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
  const stepDetails = stepNo + 1;

  const scrollDates = (dir: 1 | -1) => dateStripRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });

  const ctaHint = !selectedDate ? 'Choose a date to continue' : selectedTimeSlots.length === 0 ? 'Pick a time slot' : !venue ? 'Choose your address and map pin to reserve' : '';

  return (
    <div className="ap">
      <SEO
        title={`${artist.user.name} — ${artist.specialties?.[0] || 'Bridal'} Makeup Artist in ${artist.location}`}
        description={artist.bio || `Book ${artist.user.name}, a certified ${artist.specialties?.join(', ')} makeup artist in ${artist.location}. ${artist.rating}★ rating, verified portfolio, transparent pricing on LUME.`}
        canonical={`https://hellolume.in/artist/${id}`}
        ogImage={artist.user.avatarUrl || artist.profileImageUrl}
      />
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

        {reservations.length > 0 && (
          <section className="ap-reservations" aria-label="Your upcoming bookings">
            <strong>Your upcoming bookings with {firstName}</strong>
            {reservations.map(b => <div key={b.id}>
              <span>{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })} · {b.time} IST</span>
              <button type="button" onClick={() => navigate('/profile')}>{b.status === 'ACCEPTED' ? 'Pay now' : b.status === 'PENDING' ? 'View pending request' : 'View booking'}</button>
            </div>)}
          </section>
        )}
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
                      <p>{r.text ?? r.comment}</p>
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
                        onClick={() => { setSelectedPriceType(pt); setSelectedServiceId(null); setSelectedTimeSlots([]); }}>
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
                        onClick={() => { setSelectedServiceId(selectedServiceId === s.id ? null : s.id); setSelectedTimeSlots([]); }}>
                        <Ico n={serviceIcon(s.name)} c="rose" s={16} />
                        <span title={s.name.replace(/,\s*/g, ', ')}>{s.name.replace(/,\s*/g, ', ')}</span>
                        <em>{inr(s.price)}</em>
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
                    const day = slotsFor(ds);
                    const slots = day.filter(s => s.available).length;
                    const off = blocked || day.length === 0;
                    return (
                      <button key={ds} type="button" role="option" aria-selected={selectedDate === ds} disabled={off}
                        aria-label={d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        className={selectedDate === ds ? 'is-on' : ''}
                        onClick={() => { setSelectedDate(ds); setSelectedTimeSlots([]); }}>
                        <small>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</small>
                        <strong>{d.getDate()}</strong>
                        <em>{blocked ? 'Off' : slots > 0 ? `${slots} slot${slots > 1 ? 's' : ''}` : day.some(s => s.booked) ? 'Booked' : 'Full'}</em>
                      </button>
                    );
                  })}
                </div>
              </Step>

              {selectedDate && (
                <Step n={stepTime} title="Time" hint={artist.hourlyPrice && selectedPriceType === 'HOURLY' ? 'Pick one or more hours' : 'Pick a slot'}>
                  {daySlots.length === 0
                    ? <p className="ap-book__empty">No slots available for this date.</p>
                    : (
                      <div className="ap-times">
                        {daySlots.map(slot => {
                          const on = selectedTimeSlots.includes(slot.time) && slot.available;
                          return <button key={slot.time} type="button" disabled={!slot.available}
                            aria-pressed={on} className={on ? 'is-on' : ''}
                            onClick={() => setSelectedTimeSlots(current => on ? current.filter(t => t !== slot.time)
                              : selectedServiceId || selectedPriceType !== 'HOURLY' ? [slot.time] : [...current, slot.time])}>
                            {slot.time} – {formatSlotMinutes(slot.end)}
                            {!slot.available && <small>{slot.own ? 'Your booking (upcoming)' : slot.booked ? 'Booked' : 'Unavailable'}</small>}
                          </button>;
                        })}
                      </div>
                    )}
                </Step>
              )}

              {isBookingReady && (
                <Step n={stepDetails} title="Booking location" hint="Required">
                  <button type="button" className="ap-venue" onClick={() => isAuthenticated ? setShowLocationModal(true) : navigate('/login')}>
                    <Ico n="map-pin" c="rose" s={20} />
                    <span><strong>{venue ? 'Change address' : 'Choose address'}</strong>
                      {venue && <small>{formatSavedAddressLine(venue)}</small>}</span>
                  </button>
                  <textarea className="ap-field ap-field--area" aria-label="Optional booking notes" placeholder="Special requests or notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
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

              <button type="button" className="ap-cta" disabled={!isBookingReady || bookingLoading || showSuccessModal} onClick={handleBookingConfirm}>
                {bookingLoading ? <span className="ap-spinner" aria-label="Booking in progress" /> : 'Reserve'}
              </button>
              {ctaHint && <p className="ap-cta__hint">{ctaHint}</p>}
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
      {/* ── Booking Location & Map Pin Modal ── */}
      {showLocationModal && (
        <BookingLocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          selectedAddress={venue}
          onSelectAddress={(addr) => setVenue(addr)}
        />
      )}
    </div>
  );
};

export default ArtistDetailPage;
