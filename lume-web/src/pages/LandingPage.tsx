import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, MapPin, Search,
  Sparkles, Heart, Shield, CheckCircle, Mail, Phone,
  ArrowUpRight, Share2, MessageCircle, Video, ChevronLeft, ChevronRight, Award
} from 'lucide-react';
import { API_BASE, useAuth } from '../context/AuthContext';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import './LandingPage.css';

import img1 from '../assets/images/1.png';
import img2 from '../assets/images/2.png';
import img3 from '../assets/images/3.png';
import img4 from '../assets/images/4.png';
import img5 from '../assets/images/5.png';
import img6 from '../assets/images/6.png';
import img7 from '../assets/images/7.png';

const ASSET_IMAGES = [img1, img2, img3, img4, img5, img6, img7];

const MOCK_ARTISTS = [
  {
    id: 'm1',
    user: { name: 'Priya Sharma', avatarUrl: img1 },
    specialties: ['Bridal', 'Airbrush'],
    rating: 4.9,
    experience: 5,
    reviewCount: 120,
    isVerified: true,
    location: 'Mumbai, MH',
    startingPrice: 15000,
  },
  {
    id: 'm2',
    user: { name: 'Rohan Gupta', avatarUrl: img2 },
    specialties: ['Editorial', 'Fashion'],
    rating: 4.8,
    experience: 7,
    reviewCount: 85,
    isVerified: true,
    location: 'Delhi, NCR',
    startingPrice: 12000,
  },
  {
    id: 'm3',
    user: { name: 'Aisha Khan', avatarUrl: img3 },
    specialties: ['Party', 'Natural'],
    rating: 4.7,
    experience: 3,
    reviewCount: 45,
    isVerified: false,
    location: 'Bangalore, KA',
    startingPrice: 8000,
  },
  {
    id: 'm4',
    user: { name: 'Sneha Reddy', avatarUrl: img4 },
    specialties: ['Bridal', 'Festive'],
    rating: 4.9,
    experience: 6,
    reviewCount: 200,
    isVerified: true,
    location: 'Hyderabad, TG',
    startingPrice: 18000,
  },
  {
    id: 'm5',
    user: { name: 'Vikram Singh', avatarUrl: img5 },
    specialties: ['SFX', 'Editorial'],
    rating: 4.6,
    experience: 4,
    reviewCount: 30,
    isVerified: true,
    location: 'Pune, MH',
    startingPrice: 10000,
  },
  {
    id: 'm6',
    user: { name: 'Ananya Patel', avatarUrl: img6 },
    specialties: ['Glamour', 'Bridal'],
    rating: 5.0,
    experience: 8,
    reviewCount: 310,
    isVerified: true,
    location: 'Ahmedabad, GJ',
    startingPrice: 20000,
  }
];

const SLIDESHOW_IMAGES = [
  '/slideshow/pexels-didsss-1830447.jpg',
  '/slideshow/pexels-mart-production-7290670.jpg',
  '/slideshow/pexels-mart-production-7290681.jpg',
  '/slideshow/pexels-mart-production-7290687.jpg',
  '/slideshow/pexels-n-voitkevich-8558532.jpg',
  '/slideshow/pexels-towfiqu-barbhuiya-3440682-12449962.jpg'
];

const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>, index = 0) => {
  const target = e.currentTarget;
  const fallback = ASSET_IMAGES[index % ASSET_IMAGES.length];
  if (target.src !== fallback) {
    target.src = fallback;
  }
};



const CATEGORIES = [
  { name: 'Bridal', image: '/images/categories/bridal.jpg', desc: 'Find the perfect artists for your wedding ceremonies.' },
  { name: 'Editorial', image: '/images/categories/editorial.jpg', desc: 'High-fashion and avant-garde looks for photoshoots.' },
  { name: 'Natural', image: '/images/categories/natural.jpg', desc: 'Subtle and elegant makeup for a flawless no-makeup look.' },
  { name: 'Fantasy', image: '/images/categories/fantasy.jpg', desc: 'Creative, bold, and imaginative transformative artistry.' },
  { name: 'Festive', image: '/images/categories/festive.jpg', desc: 'Vibrant and traditional styling for your festive occasions.' },
  { name: 'Glamour', image: '/images/categories/glamour.jpg', desc: 'Red-carpet ready looks with dramatic and striking details.' },
  { name: 'SFX', image: '/images/categories/sfx.jpg', desc: 'Special effects and prosthetics for film, cosplay, or events.' },
  { name: 'Party', image: '/images/categories/party.jpg', desc: 'Stunning evening glam to make you stand out in the crowd.' },
];

/* ══════════════════════════════════════
   Scroll Reveal Hook
══════════════════════════════════════ */
const useScrollReveal = (deps: React.DependencyList = []) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
      );

      const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-up');
      targets.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 80);
    return () => clearTimeout(timer);
  }, deps);
};

/* ══════════════════════════════════════
   Lume Intro Component
══════════════════════════════════════ */
const LumeIntro: React.FC<{ onBook: () => void }> = ({ onBook }) => (
  <section className="lp-section lp-intro" id="about" aria-label="About Lume">
    <div className="lp-container">
      <div className="lp-section__header reveal" style={{ marginBottom: '56px' }}>
        <span className="lp-eyebrow">About Lume</span>
        <h2 className="lp-heading">
          Where Every Look<br />
          Becomes a <em>Masterpiece.</em>
        </h2>
      </div>
      <div className="lp-intro__grid">
        <div className="lp-intro__content reveal-left">
          <p className="lp-intro__body">
            Lume is India's most curated beauty platform, dedicated to elevating your defining moments. We connect visionaries with <strong>verified, award-winning makeup artists</strong> for bridal ceremonies, high-fashion editorial shoots, and everyday glamour.
          </p>
          <p className="lp-intro__body" style={{ marginTop: '20px' }}>
            We understand that finding the right artist is deeply personal. That's why every artist on Lume goes through a rigorous vetting process. From seamless bookings and secure payments to personalized consultations, our platform ensures a stress-free and premium experience. It's not just about booking an appointment; it's about stepping into your most luminous self.
          </p>
          <button className="lp-btn lp-btn--primary" style={{ alignSelf: 'flex-start', marginTop: '32px' }} onClick={onBook}>
            Book an Artist <ArrowRight size={16} />
          </button>
        </div>

        <div className="lp-intro__video-placeholder reveal-right" style={{
          width: '100%',
          aspectRatio: '4/5',
          maxHeight: '600px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(42, 26, 31, 0.16)'
        }}>
          <img src={img3} alt="Lume Video Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />

          {/* Play Button Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s ease',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.25)'}
          >
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                width: 0,
                height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderLeft: '18px solid var(--rose-deep)',
                marginLeft: '6px'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════
   LandingPage Component
══════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);


  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [featured, setFeatured] = useState<any[]>([]);

  useScrollReveal([featured, upcomingBookings]);

  const handleHeroSearch = () => {
    navigate(`/discover?service=${encodeURIComponent(searchService)}&location=${encodeURIComponent(searchLocation)}&category=${encodeURIComponent(activeFilter)}`);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch upcoming bookings for client
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CLIENT') {
      const token = localStorage.getItem('lume_token');
      fetch(`${API_BASE}/api/clients/me/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const upcoming = data.data.filter((b: any) => b.status === 'ACCEPTED' || b.status === 'CONFIRMED');
            setUpcomingBookings(upcoming.slice(0, 3)); // show top 3
          }
        })
        .catch(err => console.error("Failed to fetch client bookings on landing", err));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetch(`${API_BASE}/api/artists?limit=12`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.artists && data.data.artists.length > 0) {
          setFeatured(data.data.artists);
        } else {
          setFeatured(MOCK_ARTISTS);
        }
      })
      .catch(err => {
        console.error('Failed to load featured artists', err);
        setFeatured(MOCK_ARTISTS);
      });
  }, []);

  /* ── Artists: infinite looping carousel ─────────────────────────────
     The artist list is repeated (clones) on both sides of a "home" copy.
     After every slide the position silently snaps back to the home copy,
     so the strip never runs out and artists simply reappear. */
  const getPerView = (w: number) =>
    w >= 1360 ? 6 : w >= 1100 ? 5 : w >= 900 ? 4 : w >= 640 ? 3 : w >= 440 ? 2 : 1;

  const [perView, setPerView] = useState(() =>
    typeof window === 'undefined' ? 6 : getPerView(window.innerWidth)
  );
  const [slideIdx, setSlideIdx] = useState(0);
  const [animate, setAnimate] = useState(false);
  const slideLock = useRef(false);
  const slideTimer = useRef<number | undefined>(undefined);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => setPerView(getPerView(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const artistCount = featured.length;
  const slideStep = Math.max(1, Math.floor(perView / 3));
  const sideCopies = artistCount ? Math.ceil((slideStep + perView) / artistCount) : 0;
  const homeStart = sideCopies * artistCount;

  const slides = useMemo(() => {
    if (!artistCount) return [];
    const total = (2 * sideCopies + 1) * artistCount;
    return Array.from({ length: total }, (_, i) => ({
      artist: featured[i % artistCount],
      copy: Math.floor(i / artistCount),
      key: `${featured[i % artistCount].id}-${i}`,
    }));
  }, [featured, artistCount, sideCopies]);

  // (Re)start at the home copy whenever the list or layout changes
  useEffect(() => {
    window.clearTimeout(slideTimer.current);
    slideLock.current = false;
    setAnimate(false);
    setSlideIdx(homeStart);
  }, [homeStart, artistCount]);

  // After an instant (non-animated) jump, re-enable the transition on the next frames
  useEffect(() => {
    if (animate) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [animate]);

  const settleSlide = () => {
    window.clearTimeout(slideTimer.current);
    if (!artistCount) return;
    setAnimate(false);
    setSlideIdx((i) => homeStart + ((((i - homeStart) % artistCount) + artistCount) % artistCount));
    slideLock.current = false;
  };

  const slideArtists = (dir: 1 | -1) => {
    if (slideLock.current || !artistCount) return;
    slideLock.current = true;
    setAnimate(true);
    setSlideIdx((i) => i + dir * slideStep);
    // safety net in case transitionend never fires (e.g. reduced motion)
    slideTimer.current = window.setTimeout(settleSlide, 900);
  };


  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setFormSent(false), 4000);
  };

  return (
    <div className="lp">

      {/* ══════════════════════════════
          1. HERO EDITORIAL SECTION
      ══════════════════════════════ */}
      <section className="lp-hero" id="hero" aria-label="Hero section">
        {/* Slideshow Background */}
        <div className="lp-hero__bg-slider">
          {SLIDESHOW_IMAGES.map((img, index) => (
            <div
              key={index}
              className={`lp-hero__slide ${index === currentSlide ? 'lp-hero__slide--active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="lp-hero__bg-overlay"></div>
        </div>

        <div className="lp-hero__content">
          <span className="lp-hero__eyebrow">India's Premier Beauty Platform</span>
          <h1 className="lp-hero__title">
            <span className="nowrap-desktop ethereal-float-1">Curated Professional Artists for</span><br />
            <em className="lp-hero__title-accent ethereal-float-2">Your Defining Moments.</em>
          </h1>
          <p className="lp-hero__sub">
            Discover and book verified makeup artists for bridal ceremonies, editorial shoots, and everyday glam.
          </p>

          <div className="lp-hero__search-container">
            <div className="lp-search-box glass-panel">
              <div className="lp-search-input">
                <Search size={18} className="lp-search-icon" />
                <input
                  type="text"
                  placeholder="Service (e.g. Bridal HD, Airbrush)"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                />
              </div>
              <div className="lp-search-divider" />
              <div className="lp-search-input" style={{ padding: 0 }}>
                <LocationAutocomplete
                  value={searchLocation}
                  onChange={setSearchLocation}
                  icon={<MapPin size={18} className="lp-search-icon" />}
                  className="lp-search-input--autocomplete"
                />
              </div>
              <button className="lp-btn lp-btn--primary lp-search-btn" onClick={handleHeroSearch}>
                Search <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="lp-hero__filters">
            {['All', 'Bridal', 'Engagement', 'Pre-Wedding', 'Editorial', 'Party'].map(filter => (
              <button
                key={filter}
                className={`lp-filter-chip ${activeFilter === filter ? 'lp-filter-chip--active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Moving Ribbon */}
        <div className="lp-hero__marquee-wrapper">
          <div className="lp-hero__marquee">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="lp-hero__marquee-track">
                <span>BRIDAL MAKEUP</span>
                <span className="lp-hero__marquee-dot">•</span>
                <span>EDITORIAL</span>
                <span className="lp-hero__marquee-dot">•</span>
                <span>PRE-WEDDING</span>
                <span className="lp-hero__marquee-dot">•</span>
                <span>PARTY GLAM</span>
                <span className="lp-hero__marquee-dot">•</span>
                <span>AIRBRUSH</span>
                <span className="lp-hero__marquee-dot">•</span>
                <span>HAIRSTYLING</span>
                <span className="lp-hero__marquee-dot">•</span>
                <span>FASHION</span>
                <span className="lp-hero__marquee-dot">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ════════════════════════════
          LUME INTRO
      ════════════════════════════ */}
      {upcomingBookings.length > 0 && (
        <section className="lp-section lp-upcoming" style={{ padding: '60px 0', background: 'var(--light)' }}>
          <div className="lp-container">
            <h2 className="lp-heading reveal" style={{ fontSize: '2rem', marginBottom: '24px' }}>Your Upcoming Bookings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }} className="stagger">
              {upcomingBookings.map((booking: any) => (
                <div key={booking.id} className="reveal-up" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(42,26,31,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success-color, #10b981)', background: '#ecfdf5', padding: '4px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{booking.status}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--rose-deep)' }}>₹{booking.totalPaid?.toLocaleString()}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{booking.artist?.user?.name || 'Artist'}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(booking.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • {booking.time}</p>
                  </div>
                  <button className="lp-btn lp-btn--primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} onClick={() => navigate('/profile')}>
                    {booking.status === 'ACCEPTED' ? 'Pay Now' : 'View Details'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* ══════════════════════════════
          2. OUR ARTISTS
      ══════════════════════════════ */}
      <section className="lp-section lp-artists" id="artists">
        <div className="lp-container">
          <div className="lp-section__header reveal">
            <span className="lp-eyebrow">Our Artists</span>
            <h2 className="lp-heading">
              Meet the Talent Behind<br />
              <em className="shimmer-text" data-text="Every Transformation">Every Transformation</em>
            </h2>
            <p className="lp-section__lead">
              Hand-vetted, portfolio-reviewed, and loved by thousands of clients across India.
            </p>
          </div>
        </div>

        <div className="lp-artists__scroller">
          <button
            type="button"
            className="lp-artists__arrow lp-artists__arrow--prev"
            onClick={() => slideArtists(-1)}
            aria-label="Previous artists"
          >
            <ChevronLeft size={26} strokeWidth={1.75} />
          </button>

          <div
            className="lp-artists__viewport"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(dx) > 40) slideArtists(dx < 0 ? 1 : -1);
            }}
          >
            <div
              className={`lp-artists__track${animate ? '' : ' is-instant'}`}
              style={{ '--pv': perView, '--idx': slideIdx } as React.CSSProperties}
              onTransitionEnd={(e) => {
                if (e.target === e.currentTarget && e.propertyName === 'transform') settleSlide();
              }}
            >
              {slides.map(({ artist, copy, key }) => {
                const isHome = copy === sideCopies;
                const rawImg = artist.profileImageUrl || artist.user?.avatarUrl;
                const imgUrl = rawImg ? (rawImg.startsWith('/') ? `${API_BASE}${rawImg}` : rawImg) : ASSET_IMAGES[1];
                const specialties: string[] = artist.specialties?.length ? artist.specialties : ['Makeup Artist'];
                const shownSpecialties = specialties.slice(0, 2);
                const extraSpecialties = specialties.length - shownSpecialties.length;
                const hasRating = artist.rating > 0;
                const years = Number(artist.experience) || 0;
                const reviews = Number(artist.reviewCount) || 0;
                const highlight = years > 0
                  ? `${years}+ yrs experience`
                  : reviews > 0
                    ? `${reviews} client review${reviews > 1 ? 's' : ''}`
                    : artist.isVerified ? 'Verified professional' : 'Rising talent';
                return (
                  <article
                    key={key}
                    className="lp-artist-card"
                    onClick={() => navigate(`/artist/${artist.id}`)}
                    role="button"
                    tabIndex={isHome ? 0 : -1}
                    aria-hidden={isHome ? undefined : true}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/artist/${artist.id}`)}
                  >
                    <div className="lp-artist-card__img-wrap">
                      <img
                        src={imgUrl}
                        alt={artist.user?.name || 'Artist'}
                        className="lp-artist-card__img"
                        loading="lazy"
                        draggable={false}
                        onError={(e) => handleImageFallback(e, 1)}
                      />
                      <div className="lp-artist-card__overlay" />

                      {artist.isVerified && (
                        <span className="lp-artist-card__badge">
                          <CheckCircle size={12} /> Verified
                        </span>
                      )}
                      <span className={`lp-artist-card__rating-chip${hasRating ? '' : ' is-new'}`}>
                        <Star size={11} fill="currentColor" strokeWidth={0} />
                        {hasRating ? artist.rating.toFixed(1) : 'New'}
                      </span>

                      <div className="lp-artist-card__cover">
                        <h3 className="lp-artist-card__name">{artist.user?.name || 'Artist'}</h3>
                        <span className="lp-artist-card__location">
                          <MapPin size={12} /> <span>{artist.location || 'India'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="lp-artist-card__info">
                      <div className="lp-artist-card__highlight">
                        <Award size={14} />
                        <span>{highlight}</span>
                      </div>
                      <div className="lp-artist-card__tags">
                        {shownSpecialties.map((s) => (
                          <span key={s} className="lp-artist-card__tag">{s}</span>
                        ))}
                        {extraSpecialties > 0 && (
                          <span className="lp-artist-card__tag lp-artist-card__tag--more">+{extraSpecialties}</span>
                        )}
                      </div>
                      <div className="lp-artist-card__footer">
                        <span className="lp-artist-card__price">
                          <em>Starting from</em> <span style={{ fontFamily: 'var(--font-body)' }}>₹</span>{(artist.startingPrice || 0).toLocaleString()}
                        </span>
                        <span className="lp-artist-card__cta" aria-hidden="true">
                          <ArrowUpRight size={15} />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="lp-artists__arrow lp-artists__arrow--next"
            onClick={() => slideArtists(1)}
            aria-label="Next artists"
          >
            <ChevronRight size={26} strokeWidth={1.75} />
          </button>
        </div>

        <div className="lp-container">
          <div className="lp-section__more reveal">
            <button className="lp-btn lp-btn--primary" onClick={() => navigate('/discover')}>
              View All Artists <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          3. ABOUT US
      ══════════════════════════════ */}
      <LumeIntro onBook={() => navigate('/discover')} />

      {/* ══════════════════════════════
          4. CATEGORIES
      ══════════════════════════════ */}
      <section className="lp-section lp-categories" id="categories">
        <div className="lp-container">
          <div className="lp-section__header reveal">
            <span className="lp-eyebrow">Explore</span>
            <h2 className="lp-heading">
              Our <em>Categories</em>
            </h2>
            <p className="lp-section__lead">
              Discover the perfect aesthetic for your next event.<br />
              Browse through our specialized artists for every occasion.
            </p>
          </div>

          <div className="lp-categories__grid stagger">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat.name}
                className="lp-cat-card reveal-up"
                style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}
                onClick={() => navigate(`/discover?category=${cat.name.toLowerCase()}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/discover?category=${cat.name.toLowerCase()}`)}
              >
                <div className="lp-cat-card__img-wrap">
                  <img src={cat.image} alt={cat.name} className="lp-cat-card__img" loading="lazy" />
                  <div className="lp-cat-card__overlay" />
                  <span className="lp-cat-card__arrow"><ArrowUpRight size={20} /></span>
                </div>
                <h3 className="lp-cat-card__name">{cat.name}</h3>
                <p className="lp-cat-card__desc">Explore Artists</p>
                <p className="lp-cat-card__subtext">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          5. PARTNER WITH US (MERGED)
      ══════════════════════════════ */}
      <section className="lp-section lp-contact" id="partner">
        <div className="lp-container">
          <div className="lp-section__header reveal" style={{ marginBottom: '56px' }}>
            <span className="lp-eyebrow">Partner With Us</span>
            <h2 className="lp-heading">
              Join India's growing<br />
              <em>artist trust</em>
            </h2>
            <p className="lp-section__lead" style={{ maxWidth: '600px', margin: '16px auto 0' }}>
              Grow your clientele, manage your bookings, and showcase your portfolio to thousands of clients. Questions or partnerships? We'd love to hear from you.
            </p>
          </div>

          <div className="lp-contact__grid">
            {/* Info */}
            <div className="lp-contact__info reveal-left">

              <div className="lp-partner__perks stagger" style={{ justifyContent: 'flex-start', gap: '16px', margin: '0 0 24px 0' }}>
                {[
                  { icon: Sparkles, text: 'Free Profile Listing' },
                  { icon: CheckCircle, text: 'Verified Badge' },
                  { icon: Heart, text: 'Dedicated Support' },
                  { icon: Shield, text: 'Secure Payments' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="lp-partner__perk reveal" style={{ background: 'white', padding: '10px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div className="lp-partner__perk-icon" style={{ background: 'var(--blush-surface)', width: '28px', height: '28px' }}><Icon size={14} /></div>
                    <span style={{ fontSize: '0.9rem' }}>{text}</span>
                  </div>
                ))}
              </div>

              <button className="lp-btn lp-btn--primary reveal" style={{ alignSelf: 'flex-start', marginBottom: '48px' }} onClick={() => navigate('/register')}>
                Create Artist Account <ArrowRight size={16} />
              </button>

              <div className="lp-contact__details stagger">
                <a href="mailto:hello@lume.beauty" className="lp-contact__detail reveal">
                  <div className="lp-contact__icon"><Mail size={18} /></div>
                  <div>
                    <span className="lp-contact__label">Email</span>
                    <span className="lp-contact__value">hello@lume.beauty</span>
                  </div>
                </a>
                <a href="tel:+911234567890" className="lp-contact__detail reveal">
                  <div className="lp-contact__icon"><Phone size={18} /></div>
                  <div>
                    <span className="lp-contact__label">Phone</span>
                    <span className="lp-contact__value">+91 123 456 7890</span>
                  </div>
                </a>
              </div>

              <div className="lp-contact__social stagger" style={{ marginTop: '32px' }}>
                {[
                  { Icon: Share2, label: 'Instagram' },
                  { Icon: MessageCircle, label: 'Twitter' },
                  { Icon: Video, label: 'YouTube' },
                ].map(({ Icon, label }) => (
                  <a key={label} href="#" className="lp-contact__social-btn reveal" aria-label={label}>
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lp-contact__form-wrap reveal-right">
              <form className="lp-contact__form glass-panel" onSubmit={handleContact}>
                <h3 className="lp-contact__form-title">Apply or Send a Message</h3>

                {formSent && (
                  <div className="lp-contact__success">
                    <CheckCircle size={18} />
                    Message sent! We'll be in touch soon.
                  </div>
                )}

                <div className="lp-contact__field">
                  <label htmlFor="contact-name">Your Name / Business Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={contactForm.name}
                    onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="lp-contact__field">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="lp-contact__field">
                  <label htmlFor="contact-msg">Message or Portfolio Link</label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    placeholder="Tell us about yourself..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="lp-btn lp-btn--primary lp-contact__submit">
                  Submit <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
