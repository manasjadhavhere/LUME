import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, MessageCircle, Lock, Shield,
  Headphones, Sparkles, Clock, CalendarCheck, ShieldCheck,
  Award, Check, MapPin, CheckCircle2, Star, Camera, ChevronRight,
  Users, Briefcase, Phone, Send, BadgeCheck, TrendingUp
} from 'lucide-react';
import { getArtistById } from '../data/demoData';
import useFavorites from '../hooks/useFavorites';
import ServiceSelector from '../components/detail/ServiceSelector';
import DatePicker from '../components/detail/DatePicker';
import TimeSlotGrid from '../components/detail/TimeSlotGrid';
import ReviewCard from '../components/detail/ReviewCard';
import Button from '../components/ui/Button';
import './ArtistDetailPage.css';

interface DateChip {
  date: Date;
  dayName: string;
  dayNumber: number;
}

type TabId = 'services' | 'portfolio' | 'reviews';

const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const artist = useMemo(() => getArtistById(id || ''), [id]);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('services');
  const [isTabSticky, setIsTabSticky] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();
  const isArtistFavorite = artist ? isFavorite(artist.id) : false;

  const tabNavRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const portfolioRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);

  const dateChips: DateChip[] = useMemo(() => {
    if (!artist) return [];
    return artist.availability.dates.map(({ date }) => {
      const dateObj = new Date(date);
      return {
        date: dateObj,
        dayName: dateObj.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
        dayNumber: dateObj.getDate()
      };
    });
  }, [artist]);

  const currentTimeSlots = useMemo(() => {
    if (!artist) return [];
    if (!selectedDate) return artist.availability.dates[0]?.slots || [];
    const dateString = selectedDate.toISOString().split('T')[0];
    const availability = artist.availability.dates.find((a) => {
      return new Date(a.date).toISOString().split('T')[0] === dateString;
    });
    return availability?.slots || [];
  }, [selectedDate, artist]);

  const selectedService = useMemo(
    () => artist?.services.find((s) => s.id === selectedServiceId),
    [selectedServiceId, artist]
  );

  const totalPrice = selectedService?.price || artist?.startingPrice || 0;

  const sortedReviews = useMemo(() => {
    if (!artist) return [];
    const copy = [...artist.reviews];
    return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [artist]);

  // Sticky tab observer
  useEffect(() => {
    const tabEl = tabNavRef.current;
    if (!tabEl) return;
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '-1px';
    tabEl.parentElement?.insertBefore(sentinel, tabEl);

    const observer = new IntersectionObserver(
      ([entry]) => setIsTabSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => { observer.disconnect(); sentinel.remove(); };
  }, []);

  // Scroll-spy for tabs
  useEffect(() => {
    const handleScroll = () => {
      const offset = 200;
      const sections = [
        { id: 'services' as TabId, ref: servicesRef },
        { id: 'portfolio' as TabId, ref: portfolioRef },
        { id: 'reviews' as TabId, ref: reviewsRef },
      ];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].ref.current;
        if (el && el.getBoundingClientRect().top <= offset) {
          setActiveTab(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((tab: TabId) => {
    setActiveTab(tab);
    const refs = { services: servicesRef, portfolio: portfolioRef, reviews: reviewsRef };
    refs[tab].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    if (!artist) return [0, 0, 0, 0, 0];
    const dist = [0, 0, 0, 0, 0]; // 1-star to 5-star
    artist.reviews.forEach((r) => {
      const bucket = Math.min(Math.floor(r.rating), 5) - 1;
      if (bucket >= 0) dist[bucket]++;
    });
    return dist;
  }, [artist]);

  if (!artist) {
    return (
      <div className="adp artist-detail-page--error">
        <p>Artist not found</p>
        <Button onClick={() => navigate('/home')}>Back to Home</Button>
      </div>
    );
  }

  const isBookingComplete =
    selectedServiceId !== null && selectedDate !== null && selectedTimeSlot !== null;

  const completedSteps = [selectedServiceId, selectedDate, selectedTimeSlot].filter(Boolean).length;

  const handleFavoriteToggle = () => toggleFavorite(artist.id);

  const handleBookingConfirm = () => {
    if (!isBookingComplete || !selectedService) return;
    sessionStorage.setItem(
      'currentBooking',
      JSON.stringify({
        artistId: artist.id,
        artistName: artist.name,
        service: selectedService.name,
        date: selectedDate?.toISOString(),
        time: selectedTimeSlot,
        location: artist.location,
        totalPaid: totalPrice
      })
    );
    navigate('/booking/confirm');
  };

  // Portfolio images (from artist avatar + variations)
  const portfolioImages = [
    artist.avatar,
    artist.avatar + '&w=400&h=500',
    artist.avatar + '&w=300&h=400',
    artist.avatar + '&w=500&h=300',
    artist.avatar + '&w=400&h=400',
    artist.avatar + '&w=350&h=450',
  ];

  return (
    <div className="adp">
      {/* ═══════ HERO GALLERY ═══════ */}
      <section className="adp-gallery">
        <div className="adp-gallery__grid">
          <div className="adp-gallery__main">
            <img src={artist.avatar} alt={artist.name} className="adp-gallery__img" />
          </div>
          <div className="adp-gallery__side">
            <div className="adp-gallery__side-img">
              <img src={artist.avatar + '&w=400&h=300'} alt={`${artist.name} work`} className="adp-gallery__img" />
            </div>
            <div className="adp-gallery__side-img">
              <img src={artist.avatar + '&w=400&h=300&fit=facearea'} alt={`${artist.name} work`} className="adp-gallery__img" />
            </div>
          </div>
          {/* Overlay Actions */}
          <div className="adp-gallery__overlay">
            <button className="adp-gallery__action-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
            <div className="adp-gallery__action-group">
              <button className="adp-gallery__action-btn adp-gallery__action-btn--photos">
                <Camera size={16} />
                <span>{6 + Math.floor(artist.bookingCount / 10)} Photos</span>
              </button>
              <button
                className={`adp-gallery__action-btn ${isArtistFavorite ? 'adp-gallery__action-btn--active' : ''}`}
                onClick={handleFavoriteToggle}
                aria-label={isArtistFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={18} fill={isArtistFavorite ? 'currentColor' : 'none'} />
              </button>
              <button className="adp-gallery__action-btn" aria-label="Share">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ VENDOR PROFILE INFO BAR ═══════ */}
      <section className="adp-profile">
        <div className="adp-profile__container">
          <div className="adp-profile__info">
            <div className="adp-profile__avatar-wrap">
              <img src={artist.avatar} alt={artist.name} className="adp-profile__avatar" />
              <span className="adp-profile__verified">
                <BadgeCheck size={16} />
              </span>
            </div>
            <div className="adp-profile__details">
              <div className="adp-profile__name-row">
                <h1 className="adp-profile__name">{artist.name}</h1>
                {artist.badge && (
                  <span className="adp-profile__badge">
                    <Sparkles size={12} />
                    {artist.badge}
                  </span>
                )}
              </div>
              <p className="adp-profile__certification">{artist.certification}</p>
              <div className="adp-profile__meta">
                <span className="adp-profile__meta-item">
                  <MapPin size={14} />
                  {artist.location}
                </span>
                <span className="adp-profile__meta-divider">•</span>
                <span className="adp-profile__meta-item adp-profile__meta-item--rating">
                  <Star size={14} fill="var(--gold)" color="var(--gold)" />
                  {artist.rating.toFixed(1)}
                  <span className="adp-profile__meta-count">({artist.reviewCount} reviews)</span>
                </span>
                <span className="adp-profile__meta-divider">•</span>
                <span className="adp-profile__meta-item">
                  <Briefcase size={14} />
                  {artist.experience}+ yrs experience
                </span>
              </div>
              <div className="adp-profile__specialties">
                {artist.specialties.map((s) => (
                  <span key={s} className="adp-profile__specialty-tag">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="adp-profile__cta-group">
            <button className="adp-profile__cta adp-profile__cta--primary">
              <Phone size={16} />
              View Contact
            </button>
            <button className="adp-profile__cta adp-profile__cta--secondary">
              <Send size={16} />
              Send Message
            </button>
          </div>
        </div>
      </section>

      {/* ═══════ STICKY TAB NAVIGATION ═══════ */}
      <div className={`adp-tabs-wrapper ${isTabSticky ? 'adp-tabs-wrapper--sticky' : ''}`} ref={tabNavRef}>
        <nav className="adp-tabs" role="tablist">
          {(['services', 'portfolio', 'reviews'] as TabId[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`adp-tabs__tab ${activeTab === tab ? 'adp-tabs__tab--active' : ''}`}
              onClick={() => scrollToSection(tab)}
            >
              {tab === 'services' && <Briefcase size={16} />}
              {tab === 'portfolio' && <Camera size={16} />}
              {tab === 'reviews' && <Star size={16} />}
              <span>{tab === 'services' ? 'Book Now' : tab === 'portfolio' ? 'Portfolio' : `Reviews (${artist.reviewCount})`}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ═══════ MAIN CONTENT (Two-Column) ═══════ */}
      <div className="adp-content">
        <div className="adp-body">

          {/* ── LEFT / MAIN COLUMN ── */}
          <div className="adp-main">

            {/* About Section */}
            <section className="adp-section adp-about">
              <h2 className="adp-section__title">
                <Users size={20} />
                About {artist.name}
              </h2>
              <p className="adp-about__bio">
                Specializing in {artist.specialties.slice(0, 2).map(s => s.toLowerCase()).join(', ')} & luxury makeup.
                With over {artist.experience} years of experience and {artist.bookingCount}+ successful bookings,
                {artist.name.split(' ')[0]} is one of the most sought-after makeup artists in {artist.location}.
                Known for creating flawless, long-lasting looks that make every client feel confident and beautiful.
              </p>
              <div className="adp-about__stats">
                <div className="adp-about__stat">
                  <Award size={18} />
                  <div>
                    <span className="adp-about__stat-value">{artist.experience}+ Years</span>
                    <span className="adp-about__stat-label">Experience</span>
                  </div>
                </div>
                <div className="adp-about__stat">
                  <Users size={18} />
                  <div>
                    <span className="adp-about__stat-value">{artist.bookingCount}+</span>
                    <span className="adp-about__stat-label">Bookings Done</span>
                  </div>
                </div>
                <div className="adp-about__stat">
                  <TrendingUp size={18} />
                  <div>
                    <span className="adp-about__stat-value">Top {Math.floor(Math.random() * 5) + 3}%</span>
                    <span className="adp-about__stat-label">In {artist.location.split(',')[1]?.trim() || artist.location}</span>
                  </div>
                </div>
                <div className="adp-about__stat">
                  <CheckCircle2 size={18} />
                  <div>
                    <span className="adp-about__stat-value">Verified</span>
                    <span className="adp-about__stat-label">Portfolio & Credentials</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Services & Booking Section */}
            <section className="adp-section adp-booking-section" ref={servicesRef} id="services">
              <h2 className="adp-section__title">
                <Sparkles size={20} />
                Book Your Session
              </h2>

              {/* Progress Tracker */}
              <div className="adp-progress">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`adp-progress__step ${completedSteps >= step ? 'adp-progress__step--done' : ''} ${completedSteps === step - 1 ? 'adp-progress__step--current' : ''}`}>
                      <div className="adp-progress__circle">
                        {completedSteps >= step ? <Check size={14} /> : step}
                      </div>
                      <span className="adp-progress__label">
                        {step === 1 ? 'Service' : step === 2 ? 'Date' : 'Time'}
                      </span>
                    </div>
                    {step < 3 && <div className={`adp-progress__line ${completedSteps >= step ? 'adp-progress__line--done' : ''}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 1 */}
              <div className="adp-step">
                <div className="adp-step__header">
                  <span className="adp-step__number">STEP 01</span>
                  <h3 className="adp-step__title">Choose Your Service</h3>
                </div>
                <ServiceSelector
                  services={artist.services}
                  selectedService={selectedServiceId}
                  onServiceSelect={setSelectedServiceId}
                />
              </div>

              {/* Step 2 */}
              <div className="adp-step">
                <div className="adp-step__header">
                  <span className="adp-step__number">STEP 02</span>
                  <h3 className="adp-step__title">Select Date</h3>
                </div>
                <DatePicker
                  dates={dateChips}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>

              {/* Step 3 */}
              <div className="adp-step">
                <div className="adp-step__header">
                  <span className="adp-step__number">STEP 03</span>
                  <h3 className="adp-step__title">Select Time Slot</h3>
                </div>
                <TimeSlotGrid
                  slots={currentTimeSlots}
                  selectedSlot={selectedTimeSlot}
                  onSlotSelect={setSelectedTimeSlot}
                />
              </div>
            </section>

            {/* Portfolio Section */}
            <section className="adp-section adp-portfolio" ref={portfolioRef} id="portfolio">
              <h2 className="adp-section__title">
                <Camera size={20} />
                Portfolio
                <span className="adp-section__count">{portfolioImages.length}</span>
              </h2>
              <div className="adp-portfolio__grid">
                {portfolioImages.map((img, i) => (
                  <div key={i} className="adp-portfolio__item" style={{ animationDelay: `${i * 0.08}s` }}>
                    <img src={img} alt={`${artist.name} portfolio ${i + 1}`} className="adp-portfolio__img" loading="lazy" />
                    <div className="adp-portfolio__hover">
                      <Camera size={24} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="adp-section adp-reviews" ref={reviewsRef} id="reviews">
              <h2 className="adp-section__title">
                <Star size={20} />
                Reviews & Ratings
              </h2>

              {/* Rating Summary */}
              <div className="adp-reviews__summary">
                <div className="adp-reviews__score">
                  <span className="adp-reviews__score-value">{artist.rating.toFixed(1)}</span>
                  <div className="adp-reviews__score-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(artist.rating) ? 'var(--gold)' : 'transparent'} color="var(--gold)" />
                    ))}
                  </div>
                  <span className="adp-reviews__score-count">{artist.reviewCount} reviews</span>
                </div>

                <div className="adp-reviews__distribution">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDistribution[star - 1];
                    const pct = artist.reviews.length > 0 ? (count / artist.reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="adp-reviews__bar-row">
                        <span className="adp-reviews__bar-label">{star}<Star size={10} fill="var(--gold)" color="var(--gold)" /></span>
                        <div className="adp-reviews__bar-track">
                          <div className="adp-reviews__bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="adp-reviews__bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Cards */}
              <div className="adp-reviews__list">
                {(showAllReviews ? sortedReviews : sortedReviews.slice(0, 3)).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              {sortedReviews.length > 3 && (
                <button className="adp-reviews__toggle" onClick={() => setShowAllReviews(!showAllReviews)}>
                  {showAllReviews ? 'Show Less' : `View All ${sortedReviews.length} Reviews`}
                  <ChevronRight size={16} className={showAllReviews ? 'adp-reviews__toggle-icon--up' : ''} />
                </button>
              )}
            </section>
          </div>

          {/* ── RIGHT / SIDEBAR ── */}
          <aside className="adp-sidebar">

            {/* Combined Booking Summary & Price Card */}
            <div className="adp-sidebar__booking">
              <div className="adp-sidebar__booking-header-top">
                <div className="adp-sidebar__price-main">
                  <span className="adp-sidebar__price-label">Starting at</span>
                  <span className="adp-sidebar__price-value">₹{artist.startingPrice.toLocaleString()}</span>
                  <span className="adp-sidebar__price-per">per session</span>
                </div>
                <div className="adp-sidebar__demand">
                  <TrendingUp size={14} />
                  <span>In High Demand</span>
                </div>
              </div>

              <div className="adp-sidebar__booking-header">
                <CalendarCheck size={18} />
                <h3>Booking Summary</h3>
              </div>

              <div className="adp-sidebar__booking-list">
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Artist</span>
                  <span className="adp-sidebar__booking-val adp-sidebar__booking-val--artist">{artist.name}</span>
                </div>
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Service</span>
                  <span className="adp-sidebar__booking-val">{selectedService ? selectedService.name : <em className="adp-sidebar__booking-empty">Not selected</em>}</span>
                </div>
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Date</span>
                  <span className="adp-sidebar__booking-val">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                      : <em className="adp-sidebar__booking-empty">Not selected</em>
                    }
                  </span>
                </div>
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Time</span>
                  <span className="adp-sidebar__booking-val">{selectedTimeSlot || <em className="adp-sidebar__booking-empty">Not selected</em>}</span>
                </div>

                <div className="adp-sidebar__booking-divider" />

                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Service Fee</span>
                  <span className="adp-sidebar__booking-val">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="adp-sidebar__booking-row">
                  <span className="adp-sidebar__booking-label">Travel & Concierge</span>
                  <span className="adp-sidebar__booking-val adp-sidebar__booking-val--free">FREE</span>
                </div>
              </div>

              <div className="adp-sidebar__booking-total">
                <span>Total Amount</span>
                <span className="adp-sidebar__booking-total-price">₹{totalPrice.toLocaleString()}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleBookingConfirm}
                disabled={!isBookingComplete}
                className="adp-sidebar__booking-btn"
              >
                <Lock size={16} />
                Confirm Booking
              </Button>
              <span className="adp-sidebar__booking-secure">
                <Shield size={13} />
                No immediate payment required
              </span>
            </div>

            {/* Why Book Card */}
            <div className="adp-sidebar__why">
              <h3 className="adp-sidebar__why-title">
                <ShieldCheck size={20} />
                Why Book With Lume?
              </h3>
              <div className="adp-sidebar__why-list">
                <div className="adp-sidebar__why-item">
                  <div className="adp-sidebar__why-icon"><Award size={18} /></div>
                  <div>
                    <h4>Vetted Master Artists</h4>
                    <p>Hand-selected portfolio and verified credentials.</p>
                  </div>
                </div>
                <div className="adp-sidebar__why-item">
                  <div className="adp-sidebar__why-icon"><Shield size={18} /></div>
                  <div>
                    <h4>100% Escrow Protection</h4>
                    <p>Your payment is secure until service completion.</p>
                  </div>
                </div>
                <div className="adp-sidebar__why-item">
                  <div className="adp-sidebar__why-icon"><Headphones size={18} /></div>
                  <div>
                    <h4>Dedicated Concierge</h4>
                    <p>24/7 personal coordinator for your event.</p>
                  </div>
                </div>
                <div className="adp-sidebar__why-item">
                  <div className="adp-sidebar__why-icon"><Clock size={18} /></div>
                  <div>
                    <h4>Flexible Rescheduling</h4>
                    <p>Plans change? Reschedule with zero hassle.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Banner */}
            <div className="adp-sidebar__help">
              <MessageCircle size={22} />
              <div>
                <h4>Need Help Choosing?</h4>
                <p>Chat with our concierge for personalized guidance.</p>
              </div>
              <button className="adp-sidebar__help-btn">Chat Now</button>
            </div>
          </aside>
        </div>
      </div>

      {/* ═══════ TRUST BADGES ═══════ */}
      <section className="adp-trust">
        <div className="adp-trust__container">
          <div className="adp-trust__item">
            <ShieldCheck size={22} />
            <span>100% Verified</span>
          </div>
          <div className="adp-trust__item">
            <Clock size={22} />
            <span>Flexible Rescheduling</span>
          </div>
          <div className="adp-trust__item">
            <Lock size={22} />
            <span>Secure Payments</span>
          </div>
          <div className="adp-trust__item">
            <Sparkles size={22} />
            <span>Premium Brands</span>
          </div>
        </div>
      </section>

      {/* ═══════ MOBILE STICKY BAR ═══════ */}
      <div className="adp-mobile-bar">
        <div className="adp-mobile-bar__info">
          <span className="adp-mobile-bar__label">Total</span>
          <span className="adp-mobile-bar__price">₹{totalPrice.toLocaleString()}</span>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleBookingConfirm}
          disabled={!isBookingComplete}
          className="adp-mobile-bar__btn"
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  );
};

export default ArtistDetailPage;
