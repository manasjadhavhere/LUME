import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, MapPin, Search,
  Sparkles, Heart, Shield, CheckCircle, Mail, Phone,
  ArrowUpRight, Share2, MessageCircle, Video
} from 'lucide-react';
import { API_BASE, useAuth } from '../context/AuthContext';
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



const CATEGORIES = [
  { name: 'Bridal', image: img1 },
  { name: 'Editorial', image: img2 },
  { name: 'Natural', image: img4 },
  { name: 'Fantasy', image: img6 },
  { name: 'Festive', image: img7 },
  { name: 'Glamour', image: img3 },
  { name: 'SFX', image: img5 },
  { name: 'Party', image: img1 },
];

/* ══════════════════════════════════════
   Lume Intro Component
══════════════════════════════════════ */
const LumeIntro: React.FC<{ onBook: () => void }> = ({ onBook }) => (
  <section className="lp-section lp-intro" id="about" aria-label="About Lume">
    <div className="lp-container lp-intro__grid">
      <div className="lp-intro__content reveal-left">
        <span className="lp-eyebrow">About Lume</span>
        <h2 className="lp-heading" style={{ marginBottom: '24px' }}>
          Where Every Look<br />
          Becomes a <em>Masterpiece.</em>
        </h2>
        <p className="lp-intro__body">
          Lume is India's most curated beauty platform — connecting visionaries
          with <strong>verified, award-winning makeup artists</strong> for bridal
          ceremonies, editorial shoots, and everyday transformations. Not just a booking. A <em>luminous experience.</em>
        </p>
        <button className="lp-btn lp-btn--primary lp-intro__cta" onClick={onBook}>
          Book an Artist <ArrowRight size={16} />
        </button>
      </div>

      <div className="lp-intro__collage reveal-right">
        {/* Cursive Text */}
        <div className="lp-intro__cursive">
          Beauty<br />Looks Good<br />On You <span>♡</span>
        </div>
        
        {/* Main Arch Image */}
        <div className="lp-intro__arch">
          <img src={img3} alt="Beautiful bride" loading="lazy" />
        </div>
        
        {/* Floating Accent Images */}
        <div className="lp-intro__float lp-intro__float--1">
          <img src={img2} alt="Makeup brushes" loading="lazy" />
        </div>
        <div className="lp-intro__float lp-intro__float--2">
          <img src={img5} alt="Eye makeup detail" loading="lazy" />
        </div>
        <div className="lp-intro__float lp-intro__float--3">
          <img src={img4} alt="Elegant updo" loading="lazy" />
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
    fetch(`${API_BASE}/api/artists?limit=4`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFeatured(data.data.artists);
        }
      })
      .catch(err => console.error('Failed to load featured artists', err));
  }, []);
  const [featured, setFeatured] = useState<any[]>([]);


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
        <div className="lp-hero__content">
          <span className="lp-hero__eyebrow">India's Premier Beauty Platform</span>
          <h1 className="lp-hero__title">
            Curated Bridal Artists for<br />
            <em className="lp-hero__title-accent">Your Defining Moments.</em>
          </h1>
          <p className="lp-hero__sub">
            Discover and book verified makeup artists for bridal ceremonies, editorial shoots, and everyday glam.
          </p>

          <div className="lp-hero__search-container">
            <div className="lp-search-box glass-panel">
              <div className="lp-search-input">
                <Search size={18} className="lp-search-icon" />
                <input type="text" placeholder="Service (e.g. Bridal HD, Airbrush)" />
              </div>
              <div className="lp-search-divider" />
              <div className="lp-search-input">
                <MapPin size={18} className="lp-search-icon" />
                <input type="text" placeholder="City (e.g. Mumbai, Delhi NCR)" />
              </div>
              <button className="lp-btn lp-btn--primary lp-search-btn" onClick={() => navigate('/discover')}>
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
                  <button className="lp-btn lp-btn--outline-dark" style={{ width: '100%', marginTop: '8px', padding: '12px' }} onClick={() => navigate('/profile')}>
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
              <em>Every Transformation</em>
            </h2>
            <p className="lp-section__lead">
              Hand-vetted, portfolio-reviewed, and loved by thousands of clients across India.
            </p>
          </div>

          <div className="lp-artists__grid stagger">
            {featured.map((artist) => {
              const rawImg = artist.profileImageUrl || artist.user.avatarUrl;
              const imgUrl = rawImg ? (rawImg.startsWith('/') ? `${API_BASE}${rawImg}` : rawImg) : ASSET_IMAGES[1];
              return (
                <div
                  key={artist.id}
                  className="lp-artist-card reveal-scale"
                  onClick={() => navigate(`/artist/${artist.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/artist/${artist.id}`)}
                >
                  <div className="lp-artist-card__img-wrap">
                    <img src={imgUrl} alt={artist.user.name} className="lp-artist-card__img" loading="lazy" onError={(e) => handleImageFallback(e, 1)} />
                    <div className="lp-artist-card__overlay">
                      <button className="lp-artist-card__view" onClick={() => navigate(`/artist/${artist.id}`)}>
                        View Profile <ArrowRight size={14} />
                      </button>
                    </div>
                    {artist.isVerified && (
                      <span className="lp-artist-card__badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                    <div className="lp-artist-card__rating-chip">
                      <Star size={10} fill="currentColor" /> {artist.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="lp-artist-card__info">
                    <div className="lp-artist-card__meta">
                      <h3 className="lp-artist-card__name">{artist.user.name}</h3>
                    </div>
                    <p className="lp-artist-card__specialty">{artist.specialties?.length ? artist.specialties.join(' · ') : 'Makeup Artist'}</p>
                    <div className="lp-artist-card__footer">
                      <span className="lp-artist-card__location">
                        <MapPin size={11} /> {artist.location}
                      </span>
                      <span className="lp-artist-card__price">from ₹{(artist.startingPrice || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          5. PARTNER WITH US
      ══════════════════════════════ */}
      <section className="lp-section lp-partner" id="partner">
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
