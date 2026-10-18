import GeoLocationInput from '../components/ui/GeoLocationInput';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, MapPin, Play, Search, Sparkles, Star } from 'lucide-react';
import Instagram from '../components/ui/InstagramIcon';
import { API_BASE, useAuth } from '../context/AuthContext';
import useFavorites from '../hooks/useFavorites';
import detailImage from '../assets/images/1.png';
import './HomeEditorial.css';

interface HeroSlide {
  id: number;
  desktop: string;
  tabletLandscape: string;
  tabletPortrait: string;
  mobileLandscape: string;
  mobilePortrait: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    desktop: '/slideshow/1.png',
    tabletLandscape: '/slideshow_tablet_landscape/1.webp',
    tabletPortrait: '/slideshow_tablet_portrait/1.webp',
    mobileLandscape: '/slideshow_mobile_landscape/1.webp',
    mobilePortrait: '/slideshow_mobile/mob-1.png',
  },
  {
    id: 2,
    desktop: '/slideshow/2.png',
    tabletLandscape: '/slideshow_tablet_landscape/2.webp',
    tabletPortrait: '/slideshow_tablet_portrait/2.webp',
    mobileLandscape: '/slideshow_mobile_landscape/2.webp',
    mobilePortrait: '/slideshow_mobile/Mob-2.png',
  },
  {
    id: 3,
    desktop: '/slideshow/3.png',
    tabletLandscape: '/slideshow_tablet_landscape/3.webp',
    tabletPortrait: '/slideshow_tablet_portrait/3.webp',
    mobileLandscape: '/slideshow_mobile_landscape/3.webp',
    mobilePortrait: '/slideshow_mobile/Mob-3.png',
  },
  {
    id: 4,
    desktop: '/slideshow/4.png',
    tabletLandscape: '/slideshow_tablet_landscape/4.webp',
    tabletPortrait: '/slideshow_tablet_portrait/4.webp',
    mobileLandscape: '/slideshow_mobile_landscape/4.webp',
    mobilePortrait: '/slideshow_mobile/Mob-4.png',
  },
  {
    id: 5,
    desktop: '/slideshow/5.png',
    tabletLandscape: '/slideshow_tablet_landscape/5.webp',
    tabletPortrait: '/slideshow_tablet_portrait/5.webp',
    mobileLandscape: '/slideshow_mobile_landscape/5.webp',
    mobilePortrait: '/slideshow_mobile/Mob-5.png',
  },
];

const SLIDESHOW_IMAGES = HERO_SLIDES.map(s => s.desktop);

const ABOUT_IMAGES = [
  '/images/about/1.jpg',
  '/images/about/2.jpg',
  '/images/about/3.jpg',
  '/images/about/4.jpg',
];


const OCCASIONS = [
  { name: 'Bridal', caption: 'For your forever moment', image: '/images/categories/bridal.jpg' },
  { name: 'Editorial', caption: 'A little unexpected. All you.', image: '/images/categories/editorial.jpg' },
  { name: 'Glamour', caption: 'Make an entrance', image: '/images/categories/glamour.jpg' },
  { name: 'Natural', caption: 'Beautifully, effortlessly you', image: '/images/categories/natural.jpg' },
  { name: 'Party', caption: 'Vibrant, bold, ready to celebrate', image: '/images/categories/party.jpg' },
  { name: 'Festive', caption: 'Tradition woven with modern elegance', image: '/images/categories/festive.jpg' },
  { name: 'Fantasy', caption: 'Dreamlike, ethereal, otherworldly', image: '/images/categories/fantasy.jpg' },
  { name: 'SFX', caption: 'Transformative character artistry', image: '/images/categories/sfx.jpg' },
];
const ALL_CATEGORIES = ['Bridal', 'Editorial', 'Glamour', 'Natural', 'Party', 'Festive', 'Fantasy', 'SFX'];
const INSTAGRAM = 'https://www.instagram.com/_hello_lume_app/';

const PROCESS_STEPS = [
  {
    step: '01',
    tag: 'Explore & Match',
    title: 'Find your artist',
    text: 'Explore portfolios, specialties, and verified reviews. Find the artist whose style speaks to your vision.',
    video: '/videos/step-1.mp4',
    altVideo: '/videos/step1.mp4',
    poster: '/slideshow/1.png',
    linkText: 'Explore artist directory',
    linkTo: '/discover',
  },
  {
    step: '02',
    tag: 'Select & Customise',
    title: 'Make it a date',
    text: 'Choose your service, preferred date, and bespoke time slot. Send your tailored request with the details that matter.',
    video: '/videos/step-2.mp4',
    altVideo: '/videos/step2.mp4',
    poster: '/slideshow/2.png',
    linkText: 'Check available dates',
    linkTo: '/discover',
  },
  {
    step: '03',
    tag: 'Confirm & Glow',
    title: 'Look forward to it',
    text: 'Once your artist accepts, pay an advance or in full with complete booking protection and get ready for your moment.',
    video: '/videos/step-3.mp4',
    altVideo: '/videos/step3.mp4',
    poster: '/slideshow/3.png',
    linkText: 'Book with confidence',
    linkTo: '/discover',
  },
];

interface ProcessStepItem {
  step: string;
  tag: string;
  title: string;
  text: string;
  video: string;
  altVideo?: string;
  poster: string;
  linkText: string;
  linkTo: string;
}

function ProcessStepCard({ item, index, total }: { item: ProcessStepItem; index: number; total: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && !videoError) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy or abort; fail gracefully
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      try {
        videoRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      className={`home-step-card ${isHovered ? 'is-hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="home-step-card__top">
        <div className="home-step-card__num-wrap">
          <span className="home-step-card__num">{item.step}</span>
          <span className="home-step-card__tag">{item.tag}</span>
        </div>
        {index < total - 1 && (
          <div className="home-step-card__connector" aria-hidden="true">
            <span className="home-step-card__connector-line" />
            <ArrowRight size={15} className="home-step-card__connector-arrow" />
          </div>
        )}
      </div>

      <div className="home-step-card__media">
        <img
          src={item.poster}
          alt={item.title}
          className={`home-step-card__poster ${isHovered && isVideoReady && !videoError ? 'is-faded' : ''}`}
          loading="lazy"
        />

        {!videoError && (
          <video
            ref={videoRef}
            className={`home-step-card__video ${isHovered && isVideoReady ? 'is-active' : ''}`}
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setIsVideoReady(true)}
            onError={() => setVideoError(true)}
          >
            <source src={item.video} type="video/mp4" />
            {item.altVideo && <source src={item.altVideo} type="video/mp4" />}
          </video>
        )}

        <div className={`home-step-card__badge ${isHovered && isVideoReady ? 'is-playing' : ''}`}>
          <Play size={11} fill="currentColor" />
          <span>{isHovered && isVideoReady ? 'Previewing' : 'Hover to preview'}</span>
        </div>
      </div>

      <div className="home-step-card__content">
        <h3 className="home-step-card__title">{item.title}</h3>
        <p className="home-step-card__text">{item.text}</p>
        <Link to={item.linkTo} className="home-step-card__link">
          <span>{item.linkText}</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
const FAQS = [
  { question: 'How do I choose the right makeup artist?', answer: 'Start with your occasion and location. Explore each artist’s portfolio, specialties, experience, and client reviews, then compare their services and pricing to find your match.' },
  { question: 'When is my booking confirmed?', answer: 'First, send a booking request with your preferred date, time, and service. Once the artist accepts, you can make your payment from My Account to secure your booking.' },
  { question: 'Can I pay an advance?', answer: 'Yes. After your artist accepts the request, you can pay a 50% advance or the full amount through Razorpay. Your account shows any remaining balance, and the payment screen shows the price and GST breakdown.' },
  { question: 'How can I join Lume as an artist?', answer: 'Create an artist account, complete your profile, add your portfolio and services, and submit it for verification. Once approved, your profile can appear in the artist directory.' },
];

interface FeaturedArtist {
  id: string;
  user: { name: string; avatarUrl?: string };
  profileImageUrl?: string;
  specialties: string[];
  location: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}
interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  artist?: { user?: { name?: string } };
}
const mediaUrl = (url: string) => url.startsWith('/') ? `${API_BASE}${url}` : url;

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [occasion, setOccasion] = useState('');
  const [city, setCity] = useState('');
  const [artists, setArtists] = useState<FeaturedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistError, setArtistError] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);

  const [aboutSlide, setAboutSlide] = useState(0);
  const [aboutPrevSlide, setAboutPrevSlide] = useState<number | null>(null);
  const [aboutDirection, setAboutDirection] = useState<'next' | 'prev'>('next');
  const [isAboutHovered, setIsAboutHovered] = useState(false);


  const goToAboutSlide = (index: number) => {
    if (index === aboutSlide) return;
    setAboutDirection(index > aboutSlide ? 'next' : 'prev');
    setAboutPrevSlide(aboutSlide);
    setAboutSlide(index);
  };

  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const processTouchStartRef = useRef<number | null>(null);

  const handleProcessTouchStart = (e: React.TouchEvent) => {
    processTouchStartRef.current = e.touches[0].clientX;
  };

  const handleProcessTouchEnd = (e: React.TouchEvent) => {
    if (processTouchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - processTouchStartRef.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        // Swipe left -> next
        setActiveProcessStep((prev) => (prev + 1) % PROCESS_STEPS.length);
      } else {
        // Swipe right -> prev
        setActiveProcessStep((prev) => (prev - 1 + PROCESS_STEPS.length) % PROCESS_STEPS.length);
      }
    }
    processTouchStartRef.current = null;
  };

  const artistsScrollRef = useRef<HTMLDivElement>(null);

  const scrollArtists = (direction: 'left' | 'right') => {
    const el = artistsScrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.home-artist');
    const scrollStep = (firstCard ? firstCard.offsetWidth : 300) + 24;

    if (direction === 'left') {
      if (el.scrollLeft <= 10) {
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }
  };

  const occasionsScrollRef = useRef<HTMLDivElement>(null);

  const scrollOccasions = (direction: 'left' | 'right') => {
    const el = occasionsScrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.home-occasion');
    const scrollStep = (firstCard ? firstCard.offsetWidth : 280) + 24;

    if (direction === 'left') {
      if (el.scrollLeft <= 10) {
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }
  };

  // Preload all slideshow and about images on mount for instant, flicker-free transitions
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 680px)').matches;
    const isTablet = window.matchMedia('(min-width: 681px) and (max-width: 1024px)').matches;
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;

    HERO_SLIDES.forEach(slide => {
      const img = new Image();
      if (isMobile) {
        img.src = isLandscape ? slide.mobileLandscape : slide.mobilePortrait;
      } else if (isTablet) {
        img.src = isLandscape ? slide.tabletLandscape : slide.tabletPortrait;
      } else {
        img.src = slide.desktop;
      }
    });

    ABOUT_IMAGES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-advance hero slideshow with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setPrevSlide(currentSlide);
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  // Auto-advance about slideshow in order (1 -> 2 -> 3 -> 4)
  useEffect(() => {
    if (isAboutHovered) return;
    const timer = setInterval(() => {
      setAboutDirection('next');
      setAboutPrevSlide(aboutSlide);
      setAboutSlide(prev => (prev + 1) % ABOUT_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [aboutSlide, isAboutHovered]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/artists?limit=16`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Artists unavailable');
        const result = await response.json();
        if (!result.success) throw new Error('Artists unavailable');
        setArtists(result.data?.artists ?? []);
      })
      .catch(() => { if (!controller.signal.aborted) setArtistError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!token || user?.role !== 'CLIENT') return;
    const controller = new AbortController();
    fetch(`${API_BASE}/api/bookings`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(response => response.json())
      .then(result => {
        if (result.success && Array.isArray(result.data)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          setAppointments(result.data.filter((booking: Appointment) =>
            ['ACCEPTED', 'PARTIALLY_PAID', 'CONFIRMED'].includes(booking.status) && new Date(booking.date) >= today
          ).slice(0, 3));
        }
      }).catch(() => { /* The public landing page remains available offline. */ });
    return () => controller.abort();
  }, [token, user?.role]);

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ category: occasion || 'All', location: city.trim(), service: '' });
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <div className="lume-home">
      <section className="home-hero" aria-label="Hero slideshow">
        <div className="home-hero__image">
          {HERO_SLIDES.map((slide, i) => {
            const isCurrent = i === currentSlide;
            const isPrev = i === prevSlide;
            const statusClass = isCurrent ? 'hero-slide-img--current' : isPrev ? 'hero-slide-img--prev' : '';
            return (
              <picture key={slide.id} className={`hero-slide-img ${statusClass}`}>
                {/* 1. Mobile Landscape: Phone rotated sideways (wide and short, height <= 520px) */}
                <source
                  media="(orientation: landscape) and (max-height: 520px)"
                  srcSet={slide.mobileLandscape}
                />

                {/* 2. Mobile Portrait: Standard phone portrait (width <= 680px) */}
                <source
                  media="(max-width: 680px) and (orientation: portrait)"
                  srcSet={slide.mobilePortrait}
                />

                {/* 3. Mobile Fallback (width <= 680px) */}
                <source
                  media="(max-width: 680px)"
                  srcSet={slide.mobilePortrait}
                />

                {/* 4. Tablet Portrait: iPads & tablets in portrait mode (width 681px - 1024px, portrait) */}
                <source
                  media="(max-width: 1024px) and (orientation: portrait)"
                  srcSet={slide.tabletPortrait}
                />

                {/* 5. Tablet Landscape: iPads & tablets in landscape mode (width 681px - 1200px, landscape) */}
                <source
                  media="(min-width: 681px) and (max-width: 1200px) and (orientation: landscape) and (min-height: 521px)"
                  srcSet={slide.tabletLandscape}
                />

                {/* 6. Desktop / Large Screen Fallback */}
                <img
                  src={slide.desktop}
                  alt={`Lume beauty artistry inspiration ${slide.id}`}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </picture>
            );
          })}
        </div>
        <div className="home-container home-search-wrap">
          <form className="home-search" onSubmit={search} aria-label="Find a makeup artist">
            <div className="home-search__intro">
              <div className="home-search__intro-icon">
                <Sparkles size={19} strokeWidth={1.8} />
              </div>
              <div className="home-search__intro-text">
                <span className="home-search__intro-sub">Let’s make it</span>
                <span className="home-search__intro-main">your moment.</span>
              </div>
            </div>

            <div className="home-search__divider" aria-hidden="true" />

            <label className="home-search__field home-search__field--occasion">
              <span className="home-search__label">THE OCCASION</span>
              <div className="home-search__input-row">
                <Search size={17} className="home-search__icon-mobile" />
                <select aria-label="Occasion" value={occasion} onChange={event => setOccasion(event.target.value)}>
                  <option value="">What’s the occasion?</option>
                  {ALL_CATEGORIES.map(category => <option key={category}>{category}</option>)}
                </select>
                <ChevronDown size={16} className="home-search__chevron" />
              </div>
            </label>

            <div className="home-search__divider" aria-hidden="true" />

            <div className="home-search__field home-search__field--location">
              <span className="home-search__label">YOUR LOCATION</span>
              <div className="home-search__input-row">
                <MapPin size={17} className="home-search__pin" />
                <GeoLocationInput value={city} onChange={setCity} variant="hero" placeholder="City or neighbourhood" />
              </div>
            </div>

            <button className="home-button home-search__submit" type="submit">
              <span>Find artist</span>
              <span className="home-search__submit-arrow"><ArrowUpRight size={17} strokeWidth={2.4} /></span>
            </button>
          </form>
        </div>
      </section>

      {token && user?.role === 'CLIENT' && appointments.length > 0 && <section className="home-container home-appointments" aria-label="Your upcoming appointments">
        <div><span className="home-eyebrow">SOMETHING TO LOOK FORWARD TO</span><h2>Your next moment</h2></div>
        {appointments.map(booking => <Link key={booking.id} to="/profile" className="home-appointment"><CalendarDays size={24} /><div><strong>{booking.artist?.user?.name || 'Your artist'}</strong><span>{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {booking.time}</span></div><span className="home-appointment__action">{booking.status === 'ACCEPTED' ? 'Complete payment' : 'View booking'} <ArrowUpRight size={16} /></span></Link>)}
      </section>}

      <section className="home-section home-container" id="artists" aria-labelledby="artists-title">
        <div className="home-section-head">
          <div><span className="home-eyebrow">THE PEOPLE BEHIND THE GLOW</span><h2 id="artists-title">Good hands. <em>Beautiful possibilities.</em></h2></div>
          <Link to="/discover" className="home-link">The artist directory <ArrowUpRight size={18} /></Link>
        </div>
        {loading ? (
          <div className="home-artists home-artists--scroller" aria-label="Loading artists" aria-busy="true">
            {[0, 1, 2, 3].map(index => <div className="home-artist-skeleton" key={index} />)}
          </div>
        ) : artists.length > 0 ? (
          <div className="home-artists-carousel-wrapper">
            <button
              type="button"
              className="home-carousel-arrow home-carousel-arrow--left"
              onClick={() => scrollArtists('left')}
              aria-label="Previous artists"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <div
              className="home-artists home-artists--scroller"
              ref={artistsScrollRef}
              tabIndex={0}
              role="region"
              aria-label="Featured artists scroller"
            >
              {artists.map(artist => {
                const photo = artist.profileImageUrl || artist.user.avatarUrl;
                return (
                  <article className="home-artist" key={artist.id}>
                    <div className="home-artist__media">
                      <Link to={`/artist/${artist.id}`} className="home-artist__image" aria-label={`View ${artist.user.name}'s profile`}>
                        {photo ? <img src={mediaUrl(photo)} alt={artist.user.name} loading="lazy" onError={event => { event.currentTarget.hidden = true; }} /> : <span className="home-artist__initial">{artist.user.name.charAt(0)}</span>}
                        {artist.isVerified && <span className="home-artist__verified"><BadgeCheck size={14} /> Verified</span>}
                      </Link>
                      <button className={`home-artist__save ${isFavorite(artist.id) ? 'is-saved' : ''}`} type="button" aria-label={`${isFavorite(artist.id) ? 'Unsave' : 'Save'} ${artist.user.name}`} aria-pressed={isFavorite(artist.id)} onClick={() => toggleFavorite(artist.id)}>
                        <Heart size={18} fill={isFavorite(artist.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="home-artist__body">
                      <div className="home-artist__title">
                        <h3><Link to={`/artist/${artist.id}`}>{artist.user.name}</Link></h3>
                        {artist.rating > 0 ? (
                          <span className="home-artist__rating">
                            <Star size={11} fill="currentColor" /> {artist.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="home-artist__rating home-artist__rating--new">
                            <Sparkles size={11} strokeWidth={2} /> Pro
                          </span>
                        )}
                      </div>
                      <div className="home-artist__specialties">
                        {(artist.specialties && artist.specialties.length > 0 ? artist.specialties.slice(0, 2) : ['Artistry']).map(spec => (
                          <span key={spec} className="home-artist__tag">{spec}</span>
                        ))}
                      </div>
                      <div className="home-artist__location">
                        <span className="home-artist__location-icon" aria-hidden="true">
                          <MapPin size={11} strokeWidth={2.4} />
                        </span>
                        <span className="home-artist__location-text">{artist.location || 'Pan India'}</span>
                      </div>
                      <div className="home-artist__bottom">
                        <div className="home-artist__price">
                          <span className="home-artist__price-label">From</span>
                          <strong className="home-artist__price-val">₹{artist.startingPrice.toLocaleString('en-IN')}</strong>
                        </div>
                        <Link to={`/artist/${artist.id}`} className="home-artist__action" aria-label={`Explore ${artist.user.name}`}>
                          <ArrowUpRight size={18} strokeWidth={2.4} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <button
              type="button"
              className="home-carousel-arrow home-carousel-arrow--right"
              onClick={() => scrollArtists('right')}
              aria-label="Next artists"
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="home-directory">
            <div>
              <span className="home-eyebrow">YOUR PERFECT MATCH STARTS HERE</span>
              <h3>A style that speaks to you.<br />An artist who understands it.</h3>
              <p>{artistError ? 'Featured profiles are taking a little longer to arrive. You can still explore the artist directory.' : 'Explore the directory to find artists by style, location, and occasion.'}</p>
              <Link to="/discover" className="home-button">Explore the directory <ArrowUpRight size={18} /></Link>
            </div>
            <img src={detailImage} alt="The care and detail behind a finished makeup look" loading="lazy" />
          </div>
        )}
      </section>

      <section className="home-about" id="about" aria-labelledby="about-title">
        <div className="home-container home-about__grid">
          <div
            className="home-about__visual"
            onMouseEnter={() => setIsAboutHovered(true)}
            onMouseLeave={() => setIsAboutHovered(false)}
          >
            <div className={`home-about__frame home-about__frame--${aboutDirection}`}>
              {ABOUT_IMAGES.map((src, index) => {
                const isCurrent = index === aboutSlide;
                const isPrev = index === aboutPrevSlide;
                if (!isCurrent && !isPrev) return null;
                const dirClass = aboutPrevSlide !== null ? (aboutDirection === 'next' ? 'is-dir-next' : 'is-dir-prev') : 'is-initial';
                return (
                  <img
                    key={src}
                    src={src}
                    alt={`Lume artistry studio 0${index + 1}`}
                    className={`home-about__img ${isCurrent ? 'is-current' : 'is-prev'} ${dirClass}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                );
              })}

              <div className="home-about__thumbs">
                {ABOUT_IMAGES.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    className={`home-about__thumb ${index === aboutSlide ? 'is-active' : ''}`}
                    onClick={() => goToAboutSlide(index)}
                    aria-label={`View about photo 0${index + 1}`}
                    aria-current={index === aboutSlide}
                  >
                    <img src={src} alt="" />
                    <span>0{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="home-about__note">
              <div className="home-about__note-icon" aria-hidden="true">
                <Sparkles size={22} strokeWidth={1.5} />
              </div>
              <div className="home-about__note-text">
                <span className="home-about__note-line1">Your canvas.</span>
                <span className="home-about__note-line2">Our masterpiece.</span>
              </div>
            </div>
          </div>
          <div className="home-about__copy">
            <span className="home-eyebrow">A MORE PERSONAL KIND OF BEAUTY</span>
            <h2 id="about-title">You bring the vision.<br /><em>We bring the artistry.</em></h2>
            <p>The best beauty experiences start with feeling understood. Lume connects you with professional makeup artists whose work speaks to your style.</p>
            <p>Considered portfolios. Clear service details. A booking experience that gives you space to choose. Because feeling beautiful should feel like you.</p>
            <div className="home-about__details">
              <span><Check size={17} /> Explore the portfolio</span>
              <span><Check size={17} /> Find your connection</span>
            </div>
            <div className="home-about__actions">
              <Link to="/about" className="home-about__btn-story">
                <span>The Lume Story</span>
                <ArrowUpRight size={17} className="home-about__btn-story-arrow" />
              </Link>
              <Link to="/discover" className="home-link">
                Meet your artist <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-container" id="categories" aria-labelledby="occasions-title">
        <div className="home-section-head">
          <div>
            <span className="home-eyebrow">EVERY VERSION OF YOU</span>
            <h2 id="occasions-title">An occasion. <em>A feeling. A look.</em></h2>
          </div>
          <Link className="home-link" to="/categories">Explore all styles <ArrowUpRight size={18} /></Link>
        </div>
        <div className="home-occasions-carousel-wrapper">
          <button
            type="button"
            className="home-carousel-arrow home-carousel-arrow--left"
            onClick={() => scrollOccasions('left')}
            aria-label="Previous styles"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <div
            className="home-occasions home-occasions--scroller"
            ref={occasionsScrollRef}
            tabIndex={0}
            role="region"
            aria-label="Featured style categories scroller"
          >
            {OCCASIONS.map((item, index) => (
              <Link to={`/discover?category=${item.name}`} className="home-occasion" key={item.name}>
                <div className="home-occasion__image">
                  <img src={item.image} alt={`${item.name} beauty inspiration`} loading="lazy" />
                  <span className="home-occasion__number">0{index + 1}</span>
                  <span className="home-round-arrow"><ArrowUpRight size={20} /></span>
                </div>
                <h3>{item.name}</h3>
                <p>{item.caption}</p>
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="home-carousel-arrow home-carousel-arrow--right"
            onClick={() => scrollOccasions('right')}
            aria-label="Next styles"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>
        </div>
        <div className="home-more-styles" role="navigation" aria-label="Alternative style options">
          <div className="home-more-styles__intro">
            <Sparkles size={16} className="home-more-styles__sparkle" />
            <span className="home-more-styles__label">Something a little different?</span>
          </div>
          <div className="home-more-styles__pills">
            {['Party', 'Festive', 'Fantasy', 'SFX'].map(category => (
              <Link
                to={`/discover?category=${category}`}
                key={category}
                className="home-sub-box"
                aria-label={`Explore ${category} style`}
              >
                <span className="home-sub-box__text">{category}</span>
                <span className="home-sub-box__arrow" aria-hidden="true">
                  <ArrowUpRight size={13} strokeWidth={2.4} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-process" id="how-it-works" aria-labelledby="process-title">
        <div className="home-container">
          <div className="home-process__intro">
            <span className="home-eyebrow">A LITTLE LESS PLANNING. A LITTLE MORE YOU.</span>
            <h2 id="process-title">
              Beautifully simple.<br />
              <em>From first look to final touch.</em>
            </h2>
            <p className="home-process__subtitle">
              Three effortless steps from discovering your style to your defining moment.
            </p>
          </div>

          {/* Desktop 3-Column Flow */}
          <div className="home-steps-flow home-steps-flow--desktop">
            {PROCESS_STEPS.map((item, index) => (
              <ProcessStepCard
                key={item.step}
                item={item}
                index={index}
                total={PROCESS_STEPS.length}
              />
            ))}
          </div>

          {/* Mobile Swipeable Card Stack */}
          <div className="home-process-mobile-stack-wrap">
            <div className="home-process-mobile-nav" role="tablist" aria-label="Process steps">
              {PROCESS_STEPS.map((step, idx) => (
                <button
                  key={step.step}
                  type="button"
                  role="tab"
                  aria-selected={activeProcessStep === idx}
                  className={`home-process-mobile-pill ${activeProcessStep === idx ? 'is-active' : ''}`}
                  onClick={() => setActiveProcessStep(idx)}
                >
                  <span className="home-process-mobile-pill-num">{step.step}</span>
                  <span className="home-process-mobile-pill-tag">{step.title}</span>
                </button>
              ))}
            </div>

            <div
              className="home-process-stack-deck"
              onTouchStart={handleProcessTouchStart}
              onTouchEnd={handleProcessTouchEnd}
            >
              {PROCESS_STEPS.map((item, index) => {
                const diff = (index - activeProcessStep + PROCESS_STEPS.length) % PROCESS_STEPS.length;
                return (
                  <div
                    key={item.step}
                    className={`home-process-stack-slide ${diff === 0 ? 'is-active' : diff === 1 ? 'is-next' : 'is-prev'}`}
                  >
                    <ProcessStepCard
                      item={item}
                      index={index}
                      total={PROCESS_STEPS.length}
                    />
                  </div>
                );
              })}
            </div>

            <div className="home-process-mobile-controls">
              <button
                type="button"
                className="home-process-arrow-btn"
                onClick={() => setActiveProcessStep((prev) => (prev - 1 + PROCESS_STEPS.length) % PROCESS_STEPS.length)}
                aria-label="Previous step"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="home-process-dots">
                {PROCESS_STEPS.map((step, idx) => (
                  <button
                    key={step.step}
                    type="button"
                    className={`home-process-dot ${activeProcessStep === idx ? 'is-active' : ''}`}
                    onClick={() => setActiveProcessStep(idx)}
                    aria-label={`Go to step ${step.step}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="home-process-arrow-btn"
                onClick={() => setActiveProcessStep((prev) => (prev + 1) % PROCESS_STEPS.length)}
                aria-label="Next step"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <span className="home-process-swipe-hint">
              Swipe left or right to see next step
            </span>
          </div>
        </div>
      </section>

      <section className="home-section home-container home-faq" aria-labelledby="faq-title"><div><span className="home-eyebrow">BEFORE YOUR FIRST BOOKING</span><h2 id="faq-title">A few things<br /><em>you might wonder.</em></h2><p>Good experiences begin with clarity.</p></div><div className="home-faq__list">{FAQS.map(item => <details key={item.question}><summary>{item.question}<span><ChevronDown size={19} /></span></summary><p>{item.answer}</p></details>)}</div></section>

      <section className="home-community" id="community" aria-labelledby="community-title"><div className="home-container"><div className="home-section-head"><div><span className="home-eyebrow">THE MOODBOARD</span><h2 id="community-title">A little inspiration <em>goes a long way.</em></h2></div><a className="home-link" href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><Instagram size={18} /> Follow Lume <ArrowUpRight size={17} /></a></div><div className="home-moodboard">{[{ image: '/images/categories/bridal.jpg', caption: 'The bridal edit' }, { image: SLIDESHOW_IMAGES[0], caption: 'Soft-glam moments' }, { image: '/images/categories/editorial.jpg', caption: 'An editorial eye' }, { image: '/images/categories/natural.jpg', caption: 'Less, but luminous' }].map(item => <Link key={item.caption} to="/discover" className="home-mood"><img src={item.image} alt={item.caption} loading="lazy" /><span>{item.caption}<ArrowUpRight size={17} /></span></Link>)}</div></div></section>
    </div>
  );
}
