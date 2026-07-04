import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, MapPin, ChevronLeft, ChevronRight,
  Sparkles, Heart, Shield, Clock, CheckCircle, Mail, Phone,
  ExternalLink
} from 'lucide-react';
import { demoArtists } from '../data/demoData';
import './LandingPage.css';

/* ── Hero slides ── */
const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13fee7a344?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    eyebrow: 'India\'s #1 Beauty Platform',
    title: 'Your Canvas.',
    titleAccent: 'Our Masterpiece.',
    sub: 'Connect with India\'s finest beauty artists for bridal, editorial, and everyday looks.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1512496015851-a908f2604245?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    eyebrow: 'Award-Winning Artists',
    title: 'Bridal Beauty,',
    titleAccent: 'Redefined.',
    sub: 'Celebrate your most important day with artists who understand tradition and elegance.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    eyebrow: 'Editorial Excellence',
    title: 'Bold Looks.',
    titleAccent: 'Lasting Impressions.',
    sub: 'From runway to real life — discover artists who push creative boundaries.',
  },
];

/* ── Categories ── */
const CATEGORIES = [
  { name: 'Bridal', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '120+ Artists' },
  { name: 'Editorial', image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '85+ Artists' },
  { name: 'Evening Glam', image: 'https://images.unsplash.com/photo-1566977755106-4b9ee5625c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '95+ Artists' },
  { name: 'Natural', image: 'https://images.unsplash.com/photo-1512413914583-11bf279a016f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '110+ Artists' },
  { name: 'Fantasy', image: 'https://images.unsplash.com/photo-1516975080661-460d3d256877?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '45+ Artists' },
];

/* ── Marquee items ── */
const MARQUEE = ['Bridal Artistry', '✦', 'Editorial Glam', '✦', 'Natural Beauty', '✦', 'Evening Looks', '✦', 'Premium Artists', '✦', 'Verified & Trusted', '✦'];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const slideTimerRef = useRef<number>(0);

  /* Auto-advance hero */
  useEffect(() => {
    slideTimerRef.current = window.setInterval(() => {
      setActiveSlide(p => (p + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(slideTimerRef.current);
  }, []);

  const prevSlide = () => {
    clearInterval(slideTimerRef.current);
    setActiveSlide(p => (p === 0 ? HERO_SLIDES.length - 1 : p - 1));
  };
  const nextSlide = () => {
    clearInterval(slideTimerRef.current);
    setActiveSlide(p => (p + 1) % HERO_SLIDES.length);
  };

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent! We\'ll be in touch soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const featured = demoArtists.slice(0, 4);

  return (
    <div className="lp">

      {/* ══ 1. HERO SLIDESHOW ══ */}
      <section className="lp-hero" aria-label="Hero slideshow">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`lp-hero__slide ${i === activeSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className="lp-hero__overlay" />
          </div>
        ))}

        {/* Content */}
        <div className="lp-hero__content">
          <span className="lp-hero__eyebrow reveal">{HERO_SLIDES[activeSlide].eyebrow}</span>
          <h1 className="lp-hero__title">
            {HERO_SLIDES[activeSlide].title}<br />
            <em className="lp-hero__title-accent">{HERO_SLIDES[activeSlide].titleAccent}</em>
          </h1>
          <p className="lp-hero__sub">{HERO_SLIDES[activeSlide].sub}</p>
          <div className="lp-hero__cta">
            <button className="lp-btn lp-btn--light" onClick={() => navigate('/home')}>
              Book an Artist <ArrowRight size={16} />
            </button>
            <button className="lp-btn lp-btn--ghost-light" onClick={() => navigate('/discover')}>
              Explore All
            </button>
          </div>
        </div>

        {/* Slide controls */}
        <button className="lp-hero__arrow lp-hero__arrow--prev" onClick={prevSlide} aria-label="Previous slide">
          <ChevronLeft size={24} />
        </button>
        <button className="lp-hero__arrow lp-hero__arrow--next" onClick={nextSlide} aria-label="Next slide">
          <ChevronRight size={24} />
        </button>

        {/* Dots */}
        <div className="lp-hero__dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`lp-hero__dot ${i === activeSlide ? 'active' : ''}`}
              onClick={() => setActiveSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="lp-hero__scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <div className="lp-hero__scroll-line" />
        </div>
      </section>

      {/* ══ MARQUEE TICKER ══ */}
      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee__track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="lp-marquee__item">{item}</span>
          ))}
        </div>
      </div>

      {/* ══ 2. OUR ARTISTS ══ */}
      <section className="lp-section lp-artists" id="artists">
        <div className="lp-container">
          <div className="lp-section__header reveal">
            <span className="lp-eyebrow">Our Artists</span>
            <h2 className="lp-heading">Meet the Talent Behind<br /><em>Every Transformation</em></h2>
          </div>

          <div className="lp-artists__grid stagger">
            {featured.map((artist) => (
              <div
                key={artist.id}
                className="lp-artist-card reveal-scale"
                onClick={() => navigate(`/artist/${artist.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/artist/${artist.id}`)}
              >
                <div className="lp-artist-card__img-wrap">
                  <img src={artist.avatar} alt={artist.name} className="lp-artist-card__img" loading="lazy" />
                  <div className="lp-artist-card__overlay">
                    <button className="lp-artist-card__view" onClick={() => navigate(`/artist/${artist.id}`)}>
                      View Profile <ArrowRight size={14} />
                    </button>
                  </div>
                  {artist.badge && (
                    <span className="lp-artist-card__badge">{artist.badge}</span>
                  )}
                </div>
                <div className="lp-artist-card__info">
                  <div className="lp-artist-card__meta">
                    <h3 className="lp-artist-card__name">{artist.name}</h3>
                    <div className="lp-artist-card__rating">
                      <Star size={12} fill="currentColor" />
                      {artist.rating}
                    </div>
                  </div>
                  <p className="lp-artist-card__specialty">{artist.specialties.join(' · ')}</p>
                  <div className="lp-artist-card__footer">
                    <span className="lp-artist-card__location">
                      <MapPin size={12} /> {artist.location}
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

      {/* ══ 3. ABOUT US ══ */}
      <section className="lp-section lp-about" id="about">
        <div className="lp-container lp-about__grid">
          <div className="lp-about__visual reveal-left">
            <div className="lp-about__img-stack">
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Beauty artist at work"
                className="lp-about__img lp-about__img--main"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1508214751196-bfd140925c41?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Makeup artistry"
                className="lp-about__img lp-about__img--accent"
                loading="lazy"
              />
              <div className="lp-about__stat-pill">
                <strong>50K+</strong>
                <span>Happy Clients</span>
              </div>
            </div>
          </div>

          <div className="lp-about__text reveal-right">
            <span className="lp-eyebrow">About Lume</span>
            <h2 className="lp-heading">Where Beauty Meets<br /><em>Artistry & Trust</em></h2>
            <p className="lp-about__body">
              Lume was founded with a single mission — to make premium beauty artistry accessible to everyone. We connect clients with India's most talented, verified makeup artists for every occasion, from bridal ceremonies to editorial shoots.
            </p>
            <p className="lp-about__body">
              Every artist on Lume is hand-vetted, portfolio-reviewed, and backed by authentic client reviews so you always know exactly what you're booking.
            </p>
            <div className="lp-about__stats stagger">
              {[
                { n: '500+', l: 'Expert Artists' },
                { n: '15+', l: 'Cities Covered' },
                { n: '4.9★', l: 'Average Rating' },
              ].map(s => (
                <div key={s.l} className="lp-about__stat reveal">
                  <strong>{s.n}</strong>
                  <span>{s.l}</span>
                </div>
              ))}
            </div>
            <div className="lp-about__trust">
              {[
                { icon: Shield, text: '100% Verified Artists' },
                { icon: Heart, text: 'Personalized Matching' },
                { icon: Clock, text: 'Instant Confirmation' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="lp-about__trust-item">
                  <Icon size={16} /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 4. CATEGORIES ══ */}
      <section className="lp-section lp-categories" id="categories">
        <div className="lp-container">
          <div className="lp-section__header reveal">
            <span className="lp-eyebrow">Categories</span>
            <h2 className="lp-heading">Find the Perfect Look<br /><em>For Every Occasion</em></h2>
          </div>

          <div className="lp-categories__grid stagger">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat.name}
                className={`lp-cat-card reveal ${i === 0 ? 'lp-cat-card--wide' : ''}`}
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => navigate('/discover')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate('/discover')}
              >
                <img src={cat.image} alt={cat.name} className="lp-cat-card__img" loading="lazy" />
                <div className="lp-cat-card__overlay" />
                <div className="lp-cat-card__content">
                  <h3 className="lp-cat-card__name">{cat.name}</h3>
                  <span className="lp-cat-card__count">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. PARTNER WITH US ══ */}
      <section className="lp-section lp-partner" id="partner">
        <div className="lp-partner__bg" />
        <div className="lp-container lp-partner__inner">
          <div className="lp-partner__content reveal">
            <span className="lp-eyebrow lp-eyebrow--light">Partner With Us</span>
            <h2 className="lp-heading lp-heading--light">Are You a Beauty Artist?<br /><em>Join the Lume Family</em></h2>
            <p className="lp-partner__sub">
              Grow your clientele, manage your bookings, and showcase your portfolio to thousands of clients actively looking for your expertise.
            </p>
            <div className="lp-partner__perks stagger">
              {[
                { icon: Sparkles, text: 'Free Profile Listing' },
                { icon: CheckCircle, text: 'Verified Artist Badge' },
                { icon: Heart, text: 'Dedicated Support' },
                { icon: Shield, text: 'Secure Payments' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="lp-partner__perk">
                  <Icon size={18} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <button className="lp-btn lp-btn--light lp-partner__cta">
              Apply to Join <ArrowRight size={16} />
            </button>
          </div>

          <div className="lp-partner__visual reveal-right">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Beauty artist"
              className="lp-partner__img"
              loading="lazy"
            />
            <div className="lp-partner__card glass">
              <strong>500+</strong>
              <span>Artists Already on Lume</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 6. CONTACT ══ */}
      <section className="lp-section lp-contact" id="contact">
        <div className="lp-container lp-contact__grid">
          <div className="lp-contact__info reveal-left">
            <span className="lp-eyebrow">Contact Us</span>
            <h2 className="lp-heading">Let's Talk<br /><em>Beauty</em></h2>
            <p className="lp-contact__sub">
              Questions, partnerships, press inquiries — we'd love to hear from you.
            </p>
            <div className="lp-contact__details">
              <a href="mailto:hello@lume.beauty" className="lp-contact__detail">
                <div className="lp-contact__icon"><Mail size={18} /></div>
                <div>
                  <span className="lp-contact__label">Email</span>
                  <span className="lp-contact__value">hello@lume.beauty</span>
                </div>
              </a>
              <a href="tel:+911234567890" className="lp-contact__detail">
                <div className="lp-contact__icon"><Phone size={18} /></div>
                <div>
                  <span className="lp-contact__label">Phone</span>
                  <span className="lp-contact__value">+91 123 456 7890</span>
                </div>
              </a>
            </div>
            <div className="lp-contact__social">
              {['Instagram', 'Twitter', 'YouTube'].map((label) => (
                <a key={label} href="#" className="lp-contact__social-btn" aria-label={label}>
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="lp-contact__form-wrap reveal-right">
            <form className="lp-contact__form glass-panel" onSubmit={handleContact}>
              <h3 className="lp-contact__form-title">Send us a Message</h3>
              <div className="lp-contact__field">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={contactForm.name}
                  onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
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
                  onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
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
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
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
