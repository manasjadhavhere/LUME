import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, MapPin, ChevronLeft, ChevronRight,
  Sparkles, Heart, Shield, Clock, CheckCircle, Mail, Phone,
  ArrowUpRight, Play, Share2, MessageCircle, Video
} from 'lucide-react';
import { demoArtists } from '../data/demoData';
import './LandingPage.css';

import img1 from '../assets/images/1.png';
import img2 from '../assets/images/2.png';
import img3 from '../assets/images/3.png';
import img4 from '../assets/images/4.png';
import img5 from '../assets/images/5.png';
import img6 from '../assets/images/6.png';
import img7 from '../assets/images/7.png';

const ASSET_IMAGES = [img1, img2, img3, img4, img5, img6, img7];

const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>, index = 0) => {
  const target = e.currentTarget;
  const fallback = ASSET_IMAGES[index % ASSET_IMAGES.length];
  if (target.src !== fallback) {
    target.src = fallback;
  }
};

/* ── Hero slides ── */
const HERO_SLIDES = [
  {
    id: 1,
    image: img1,
    eyebrow: "India's #1 Beauty Platform",
    title: 'Your Canvas.',
    titleAccent: 'Our Masterpiece.',
    sub: "Connect with India's finest beauty artists for bridal, editorial, and everyday looks.",
    tag: 'Bridal · Editorial · Glam',
  },
  {
    id: 2,
    image: img4,
    eyebrow: 'Award-Winning Artists',
    title: 'Bridal Beauty,',
    titleAccent: 'Redefined.',
    sub: 'Celebrate your most important day with artists who understand tradition and elegance.',
    tag: 'Wedding · Ceremony · Heritage',
  },
  {
    id: 3,
    image: img5,
    eyebrow: 'Editorial Excellence',
    title: 'Bold Looks.',
    titleAccent: 'Lasting Impressions.',
    sub: 'From runway to real life — discover artists who push creative boundaries.',
    tag: 'Editorial · Avant-garde · Fashion',
  },
];

/* ── Categories ── */
const CATEGORIES = [
  { name: 'Bridal', image: img1, count: '120+ Artists', wide: true },
  { name: 'Editorial', image: img2, count: '95+ Artists' },
  { name: 'Natural', image: img4, count: '110+ Artists' },
  { name: 'Fantasy', image: img6, count: '45+ Artists' },
];

/* ── Marquee ── */
const MARQUEE = ['Bridal Artistry', '✦', 'Editorial Glam', '✦', 'Natural Beauty', '✦', 'Evening Looks', '✦', 'Premium Artists', '✦', 'Verified & Trusted', '✦'];

/* ── Stats ── */
/* const STATS = [
  { n: '500+', l: 'Expert Artists' },
  { n: '15+',  l: 'Cities Covered' },
  { n: '50K+', l: 'Happy Clients' },
  { n: '4.9★', l: 'Avg. Rating' },
]; */

/* ══════════════════════════════════════
   Scroll Reveal Hook
══════════════════════════════════════ */
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Don't unobserve — keep visible once triggered
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

/* ══════════════════════════════════════
   Hero Light Particles
══════════════════════════════════════ */
const HeroLights: React.FC = () => (
  <div className="lp-hero__lights" aria-hidden="true">
    <div className="lp-hero__light lp-hero__light--1" />
    <div className="lp-hero__light lp-hero__light--2" />
    <div className="lp-hero__light lp-hero__light--3" />
    <div className="lp-hero__light lp-hero__light--4" />
  </div>
);

/* ══════════════════════════════════════
   Lume Intro Component
══════════════════════════════════════ */
const LumeIntro: React.FC<{ onBook: () => void; onExplore: () => void }> = ({ onBook, onExplore }) => (
  <section className="lp-intro" id="intro" aria-label="About Lume">
    {/* Animated background orbs */}
    <div className="lp-intro__orb lp-intro__orb--1" aria-hidden="true" />
    <div className="lp-intro__orb lp-intro__orb--2" aria-hidden="true" />
    <div className="lp-intro__orb lp-intro__orb--3" aria-hidden="true" />

    {/* Floating sparkle particles */}
    <div className="lp-intro__spark lp-intro__spark--1" aria-hidden="true" />
    <div className="lp-intro__spark lp-intro__spark--2" aria-hidden="true" />
    <div className="lp-intro__spark lp-intro__spark--3" aria-hidden="true" />
    <div className="lp-intro__spark lp-intro__spark--4" aria-hidden="true" />

    <div className="lp-intro__inner">
      {/* Left: Text */}
      <div className="lp-intro__text reveal-left">
        {/* <div className="lp-intro__badge">
          <span className="lp-intro__badge-dot" />
          Redefining Beauty in India
        </div> */}

        <h2 className="lp-intro__heading">
          Where Every Look<br />
          Becomes a <em>Masterpiece.</em>
        </h2>

        <p className="lp-intro__tagline">
          Lume is India's most curated beauty platform — connecting visionaries
          with <strong>verified, award-winning makeup artists</strong> for bridal
          ceremonies, editorial shoots, and everyday transformations.
          Not just a booking. A&nbsp;<strong>luminous experience.</strong>
        </p>

        <div className="lp-intro__divider">
          <div className="lp-intro__divider-line" />
          <span className="lp-intro__divider-icon"><Sparkles size={16} /></span>
          <div className="lp-intro__divider-line" />
        </div>

        <div className="lp-intro__micro-stats">
          <div className="lp-intro__micro-stat">
            <strong>500+</strong>
            <span>Expert Artists</span>
          </div>
          <div className="lp-intro__micro-stat">
            <strong>50K+</strong>
            <span>Happy Clients</span>
          </div>
          <div className="lp-intro__micro-stat">
            <strong>4.9★</strong>
            <span>Avg. Rating</span>
          </div>
          <div className="lp-intro__micro-stat">
            <strong>15+</strong>
            <span>Cities</span>
          </div>
        </div>

        <div className="lp-intro__cta">
          <button className="lp-btn lp-btn--primary" onClick={onBook}>
            Book an Artist <ArrowRight size={16} />
          </button>
          <button className="lp-btn lp-btn--ghost-dark" onClick={onExplore}>
            <Play size={13} fill="currentColor" /> Explore Gallery
          </button>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="lp-intro__visual reveal-right">
        <div className="lp-intro__glass-main">
          <img
            src={img3}
            alt="Lume beauty artistry — a bride in premium makeup"
            className="lp-intro__img"
            loading="lazy"
          />
        </div>

        {/* Floating glass card 1 */}
        <div className="lp-intro__float-card lp-intro__float-card--1">
          <div className="lp-intro__float-icon">
            <Heart size={20} fill="white" />
          </div>
          <div className="lp-intro__float-text">
            <strong>50K+</strong>
            <span>Happy Clients</span>
          </div>
        </div>

        {/* Floating glass card 2 */}
        <div className="lp-intro__float-card lp-intro__float-card--2">
          <div className="lp-intro__float-icon">
            <Sparkles size={16} />
          </div>
          <div className="lp-intro__float-text">
            <strong>4.9★</strong>
            <span>Avg. Rating</span>
          </div>
        </div>

        {/* Decorative spinning ring */}
        <div className="lp-intro__deco-ring" aria-hidden="true" />
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════
   LandingPage Component
══════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);
  const slideTimerRef = useRef<number>(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useScrollReveal();

  /* ── Hero parallax on scroll ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setParallaxY(y * 0.35);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Auto-advance hero ── */
  const startTimer = useCallback(() => {
    clearInterval(slideTimerRef.current);
    slideTimerRef.current = window.setInterval(() => {
      setActiveSlide((p) => {
        setPrevSlide(p);
        return (p + 1) % HERO_SLIDES.length;
      });
    }, 5500);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(slideTimerRef.current);
  }, [startTimer]);

  const goTo = (i: number) => {
    setPrevSlide(activeSlide);
    setActiveSlide(i);
    startTimer();
  };
  const goPrev = () => goTo(activeSlide === 0 ? HERO_SLIDES.length - 1 : activeSlide - 1);
  const goNext = () => goTo((activeSlide + 1) % HERO_SLIDES.length);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setFormSent(false), 4000);
  };

  const featured = demoArtists.slice(0, 4);

  return (
    <div className="lp">

      {/* ══════════════════════════════
          1. HERO SLIDESHOW
      ══════════════════════════════ */}
      <section className="lp-hero" id="hero" ref={heroRef} aria-label="Hero slideshow">

        {/* Background slides with parallax */}
        <div className="lp-hero__bg-wrap" style={{ transform: `translateY(${parallaxY}px)` }}>
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              className={`lp-hero__slide ${i === activeSlide ? 'lp-hero__slide--active' : ''} ${i === prevSlide ? 'lp-hero__slide--prev' : ''}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
          ))}
        </div>

        {/* Cinematic overlays */}
        <div className="lp-hero__overlay" />
        <div className="lp-hero__overlay-bottom" />

        {/* Animated light flares */}
        <HeroLights />

        {/* Slide number indicator */}
        <div className="lp-hero__slide-num" aria-hidden="true">
          <span className="lp-hero__slide-current">{String(activeSlide + 1).padStart(2, '0')}</span>
          <span className="lp-hero__slide-sep" />
          <span className="lp-hero__slide-total">{String(HERO_SLIDES.length).padStart(2, '0')}</span>
        </div>

        {/* Hero Content */}
        <div className="lp-hero__content">
          {/* Animated text — re-mounts on slide change */}
          <div key={activeSlide} className="lp-hero__content-inner lp-hero__content--animate">
            <span className="lp-hero__tag">{HERO_SLIDES[activeSlide].tag}</span>
            <span className="lp-hero__eyebrow">{HERO_SLIDES[activeSlide].eyebrow}</span>
            <h1 className="lp-hero__title">
              {HERO_SLIDES[activeSlide].title}<br />
              <em className="lp-hero__title-accent">{HERO_SLIDES[activeSlide].titleAccent}</em>
            </h1>
            <p className="lp-hero__sub">{HERO_SLIDES[activeSlide].sub}</p>
          </div>
        </div>

        {/* Arrows */}
        <button className="lp-hero__arrow lp-hero__arrow--prev" onClick={goPrev} aria-label="Previous slide">
          <ChevronLeft size={22} />
        </button>
        <button className="lp-hero__arrow lp-hero__arrow--next" onClick={goNext} aria-label="Next slide">
          <ChevronRight size={22} />
        </button>

        {/* Unified Bottom Controls — Buttons sitting exactly above slideshow dots */}
        <div className="lp-hero__bottom-controls">
          <div className="lp-hero__cta">
            <button className="lp-btn lp-btn--light" onClick={() => navigate('/home')}>
              Book an Artist <ArrowRight size={16} />
            </button>
            <button className="lp-btn lp-btn--ghost-light" onClick={() => navigate('/reels')}>
              <Play size={14} fill="currentColor" /> Watch Reel
            </button>
          </div>

          <div className="lp-hero__dots" role="tablist" aria-label="Slide navigation">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeSlide}
                className={`lp-hero__dot ${i === activeSlide ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="lp-hero__scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <div className="lp-hero__scroll-line" />
        </div>

        {/* Trust badges */}
        {/* <div className="lp-hero__trust" aria-hidden="true">
          <div className="lp-hero__trust-item"><Shield size={13} /> 100% Verified</div>
          <div className="lp-hero__trust-item"><Star size={13} fill="currentColor" /> 4.9 Rating</div>
          <div className="lp-hero__trust-item"><CheckCircle size={13} /> Instant Booking</div>
        </div> */}
      </section>

      {/* ══════════════════════════════
          MARQUEE TICKER
      ══════════════════════════════ */}
      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee__track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="lp-marquee__item">{item}</span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════
          LUME INTRO
      ════════════════════════════ */}
      <LumeIntro onBook={() => navigate('/home')} onExplore={() => navigate('/discover')} />

      {/* ══════════════════════════════
          2. OUR ARTISTS
      ══════════════════════════════ */}
      <section className="lp-section lp-artists" id="artists">
        <div className="lp-container">
          <div className="lp-section__header reveal">
            <span className="lp-eyebrow">Our Artists</span>
            <h2 className="lp-heading">
              Meet the Talent Behind<br />
              <em>Every Transformation</em>
            </h2>
            <p className="lp-section__lead">
              Hand-vetted, portfolio-reviewed, and loved by thousands of clients across India.
            </p>
          </div>

          <div className="lp-artists__grid stagger">
            {featured.map((artist) => (
              <div
                key={artist.id}
                className="lp-artist-card reveal-scale"
                onClick={() => navigate(`/artist/${artist.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/artist/${artist.id}`)}
              >
                <div className="lp-artist-card__img-wrap">
                  <img src={artist.avatar} alt={artist.name} className="lp-artist-card__img" loading="lazy" onError={(e) => handleImageFallback(e, 1)} />
                  <div className="lp-artist-card__overlay">
                    <button className="lp-artist-card__view" onClick={() => navigate(`/artist/${artist.id}`)}>
                      View Profile <ArrowRight size={14} />
                    </button>
                  </div>
                  {artist.badge && (
                    <span className="lp-artist-card__badge">{artist.badge}</span>
                  )}
                  <div className="lp-artist-card__rating-chip">
                    <Star size={10} fill="currentColor" /> {artist.rating}
                  </div>
                </div>
                <div className="lp-artist-card__info">
                  <div className="lp-artist-card__meta">
                    <h3 className="lp-artist-card__name">{artist.name}</h3>
                  </div>
                  <p className="lp-artist-card__specialty">{artist.specialties.join(' · ')}</p>
                  <div className="lp-artist-card__footer">
                    <span className="lp-artist-card__location">
                      <MapPin size={11} /> {artist.location}
                    </span>
                    <span className="lp-artist-card__price">from ₹{artist.startingPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-section__more reveal">
            <button className="lp-btn lp-btn--outline" onClick={() => navigate('/discover')}>
              View All Artists <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          3. ABOUT US
      ══════════════════════════════ */}
      <section className="lp-section lp-about" id="about">
        <div className="lp-container lp-about__grid">

          {/* Visual */}
          <div className="lp-about__visual reveal-left">
            <div className="lp-about__img-stack">
              <img
                src={img5}
                alt="Beauty artist at work"
                className="lp-about__img lp-about__img--main"
                loading="lazy"
              />
              <img
                src={img3}
                alt="Makeup artistry detail"
                className="lp-about__img lp-about__img--accent"
                loading="lazy"
              />
              <div className="lp-about__stat-pill reveal">
                <Sparkles size={16} className="lp-about__stat-pill-icon" />
                <strong>50K+</strong>
                <span>Happy Clients</span>
              </div>
              {/* Decorative ring */}
              <div className="lp-about__deco-ring" aria-hidden="true" />
            </div>
          </div>

          {/* Text */}
          <div className="lp-about__text reveal-right">
            <span className="lp-eyebrow">About Lume</span>
            <h2 className="lp-heading">
              Where Beauty Meets<br />
              <em>Artistry & Trust</em>
            </h2>
            <p className="lp-about__body">
              Lume was founded with a single mission — to make premium beauty artistry accessible to everyone. We connect clients with India's most talented, verified makeup artists for every occasion, from bridal ceremonies to editorial shoots.
            </p>
            <p className="lp-about__body">
              Every artist on Lume is hand-vetted, portfolio-reviewed, and backed by authentic client reviews so you always know exactly what you're booking.
            </p>

            <div className="lp-about__trust stagger">
              {[
                { icon: Shield, text: '100% Verified Artists' },
                { icon: Heart, text: 'Personalized Matching' },
                { icon: Clock, text: 'Instant Confirmation' },
                { icon: CheckCircle, text: 'Secure Payments' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="lp-about__trust-item reveal">
                  <div className="lp-about__trust-icon"><Icon size={15} /></div>
                  {text}
                </div>
              ))}
            </div>

            <div className="lp-about__cta-row reveal">
              <button className="lp-btn lp-btn--primary" onClick={() => navigate('/discover')}>
                Explore Artists <ArrowRight size={16} />
              </button>
              <button className="lp-btn lp-btn--ghost-dark" onClick={() => navigate('/home')}>
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          4. CATEGORIES
      ══════════════════════════════ */}
      <section className="lp-section lp-categories" id="categories">
        <div className="lp-container">
          <div className="lp-section__header reveal">
            <span className="lp-eyebrow">Categories</span>
            <h2 className="lp-heading">
              Find the Perfect Look<br />
              <em>For Every Occasion</em>
            </h2>
          </div>

          <div className="lp-categories__grid stagger">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat.name}
                className={`lp-cat-card reveal-scale ${cat.wide ? 'lp-cat-card--wide' : ''}`}
                style={{ '--delay': `${i * 0.07}s` } as React.CSSProperties}
                onClick={() => navigate('/discover')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/discover')}
              >
                <img src={cat.image} alt={cat.name} className="lp-cat-card__img" loading="lazy" />
                <div className="lp-cat-card__overlay" />
                <div className="lp-cat-card__content">
                  <h3 className="lp-cat-card__name">{cat.name}</h3>
                  <span className="lp-cat-card__count">{cat.count}</span>
                  <span className="lp-cat-card__arrow"><ArrowUpRight size={18} /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          5. PARTNER WITH US
      ══════════════════════════════ */}
      <section className="lp-section lp-partner" id="partner">
        <div className="lp-partner__bg" aria-hidden="true">
          <div className="lp-partner__bg-orb lp-partner__bg-orb--1" />
          <div className="lp-partner__bg-orb lp-partner__bg-orb--2" />
        </div>

        <div className="lp-container lp-partner__inner">
          <div className="lp-partner__content">
            <span className="lp-eyebrow lp-eyebrow--light reveal">Partner With Us</span>
            <h2 className="lp-heading lp-heading--light reveal">
              Are You a Beauty Artist?<br />
              <em>Join the Lume Family</em>
            </h2>
            <p className="lp-partner__sub reveal">
              Grow your clientele, manage your bookings, and showcase your portfolio to thousands of clients actively looking for your expertise.
            </p>
            <div className="lp-partner__perks stagger">
              {[
                { icon: Sparkles, text: 'Free Profile Listing' },
                { icon: CheckCircle, text: 'Verified Artist Badge' },
                { icon: Heart, text: 'Dedicated Support' },
                { icon: Shield, text: 'Secure Payments' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="lp-partner__perk reveal">
                  <div className="lp-partner__perk-icon"><Icon size={16} /></div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <button className="lp-btn lp-btn--primary lp-partner__cta reveal" onClick={() => navigate('/home')}>
              Apply to Join <ArrowRight size={16} />
            </button>
          </div>

          <div className="lp-partner__visual reveal-right">
            <div className="lp-partner__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80"
                alt="Beauty artist"
                className="lp-partner__img"
                loading="lazy"
              />
              <div className="lp-partner__card glass">
                <Sparkles size={20} className="lp-partner__card-icon" />
                <strong>500+</strong>
                <span>Artists Already on Lume</span>
              </div>
              <div className="lp-partner__card-2 glass">
                <Star size={14} fill="currentColor" />
                <strong>4.9</strong>
                <span>Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          6. CONTACT
      ══════════════════════════════ */}
      <section className="lp-section lp-contact" id="contact">
        <div className="lp-container lp-contact__grid">

          {/* Info */}
          <div className="lp-contact__info reveal-left">
            <span className="lp-eyebrow">Contact Us</span>
            <h2 className="lp-heading">
              Let's Talk<br /><em>Beauty</em>
            </h2>
            <p className="lp-contact__sub">
              Questions, partnerships, press inquiries — we'd love to hear from you.
            </p>

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

            <div className="lp-contact__social stagger">
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
              <h3 className="lp-contact__form-title">Send us a Message</h3>

              {formSent && (
                <div className="lp-contact__success">
                  <CheckCircle size={18} />
                  Message sent! We'll be in touch soon.
                </div>
              )}

              <div className="lp-contact__field">
                <label htmlFor="contact-name">Your Name</label>
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
                <label htmlFor="contact-msg">Message</label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  placeholder="How can we help you?"
                  value={contactForm.message}
                  onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="lp-btn lp-btn--primary lp-contact__submit">
                Send Message <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
