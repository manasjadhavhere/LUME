import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Palette,
  Gem,
  Check,
  Quote,
  Compass,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './AboutPage.css';

const PILLARS = [
  {
    icon: ShieldCheck,
    tag: 'TENET 01',
    shortLabel: '01 Mastery',
    title: 'Certified Mastery',
    desc: 'Every artist on Lume undergoes stringent verification for technical mastery, portfolio authenticity, and hygiene standards.'
  },
  {
    icon: Palette,
    tag: 'TENET 02',
    shortLabel: '02 Style',
    title: 'Style-First Alignment',
    desc: 'Browse portfolios organized by signature aesthetics so you connect with the artist whose hand naturally speaks your style.'
  },
  {
    icon: Gem,
    tag: 'TENET 03',
    shortLabel: '03 Transparency',
    title: 'Radical Transparency',
    desc: 'No vague negotiations or hidden fees. Upfront pricing, verified reviews, and secure instant reservations.'
  }
];

export default function AboutPage() {
  const [activeStoryTab, setActiveStoryTab] = useState(0);
  const [activePillarTab, setActivePillarTab] = useState(0);

  const storyTouchStartRef = useRef<number | null>(null);
  const pillarTouchStartRef = useRef<number | null>(null);

  const handleStoryTouchStart = (e: React.TouchEvent) => {
    storyTouchStartRef.current = e.touches[0].clientX;
  };
  const handleStoryTouchEnd = (e: React.TouchEvent) => {
    if (storyTouchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - storyTouchStartRef.current;
    if (Math.abs(diff) > 35) {
      if (diff < 0) {
        setActiveStoryTab((prev) => (prev + 1) % 3);
      } else {
        setActiveStoryTab((prev) => (prev - 1 + 3) % 3);
      }
    }
    storyTouchStartRef.current = null;
  };

  const handlePillarTouchStart = (e: React.TouchEvent) => {
    pillarTouchStartRef.current = e.touches[0].clientX;
  };
  const handlePillarTouchEnd = (e: React.TouchEvent) => {
    if (pillarTouchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - pillarTouchStartRef.current;
    if (Math.abs(diff) > 35) {
      if (diff < 0) {
        setActivePillarTab((prev) => (prev + 1) % PILLARS.length);
      } else {
        setActivePillarTab((prev) => (prev - 1 + PILLARS.length) % PILLARS.length);
      }
    }
    pillarTouchStartRef.current = null;
  };

  return (
    <div className="about-page">
      {/* ── Compact Editorial Hero ── */}
      <section className="about-hero">
        <div className="about-container">
          <div className="about-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span className="current">About Lume</span>
          </div>

          <div className="about-hero__badge">
            <Sparkles size={14} />
            <span>THE LUME MANIFESTO</span>
          </div>

          <h1 className="about-hero__headline">
            “Your canvas.<br />
            <em>Our masterpiece.”</em>
          </h1>

          <p className="about-hero__sub">
            Born in Mumbai, Lume was created as an antidote to impersonal booking apps—connecting clients with vetted,
            certified makeup artists across India through transparent pricing and authentic style alignment.
          </p>

          <div className="about-hero__tags">
            <span><Check size={14} /> Vetted Master Artists</span>
            <span><Check size={14} /> Upfront Pricing Transparency</span>
            <span><Check size={14} /> Style Alignment Guaranteed</span>
          </div>
        </div>
      </section>

      {/* ── Consolidated Story Section ── */}
      <section className="about-story-section">
        <div className="about-container">
          {/* Desktop Layout */}
          <div className="about-story-card about-story-card--desktop">
            <div className="about-story-card__content">
              <span className="about-eyebrow">A SANCTUARY FOR MASTER ARTISTRY</span>
              <h2>How a vision became <em>a beauty movement.</em></h2>

              <p className="about-story-p">
                In a world where life's defining moments happen only once—weddings, editorial shoots, galas, and celebrations—finding
                a certified makeup artist in India was often an uncertain gamble of unvetted DMs, unpredictable quotes, and mismatched aesthetics.
              </p>
              <p className="about-story-p">
                We founded Lume in Mumbai to change that. We partner directly with leading independent certified makeup artists, giving them
                a premier stage where their portfolios are celebrated and their clients feel deeply understood and dignified.
              </p>

              <blockquote className="about-story-quote">
                <Quote size={20} className="about-story-quote-icon" />
                <p>
                  “Getting your makeup done should never feel transactional. It should feel like stepping into your most radiant self—with complete trust.”
                </p>
                <cite>— Sahil Pawar, Founder & CEO</cite>
              </blockquote>
            </div>

            <div className="about-story-card__media">
              <div className="about-story-frame">
                <img src="/images/about/2.jpg" alt="Lume Artistry Studio" loading="eager" />
                <div className="about-story-badge">
                  <Compass size={14} />
                  <span>Mumbai Atelier · Pan-India Vision</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Swipeable Story Stack */}
          <div className="about-story-mobile">
            <div className="about-mobile-nav" role="tablist" aria-label="Story sections">
              <button
                type="button"
                className={`about-mobile-pill ${activeStoryTab === 0 ? 'is-active' : ''}`}
                onClick={() => setActiveStoryTab(0)}
              >
                The Vision
              </button>
              <button
                type="button"
                className={`about-mobile-pill ${activeStoryTab === 1 ? 'is-active' : ''}`}
                onClick={() => setActiveStoryTab(1)}
              >
                The Atelier
              </button>
              <button
                type="button"
                className={`about-mobile-pill ${activeStoryTab === 2 ? 'is-active' : ''}`}
                onClick={() => setActiveStoryTab(2)}
              >
                The Founder
              </button>
            </div>

            <div
              className="about-mobile-deck"
              onTouchStart={handleStoryTouchStart}
              onTouchEnd={handleStoryTouchEnd}
            >
              {/* Slide 0: The Vision */}
              <div className={`about-mobile-slide ${activeStoryTab === 0 ? 'is-active' : 'is-hidden'}`}>
                <div className="about-mobile-card">
                  <span className="about-eyebrow">OUR VISION</span>
                  <h3>A Sanctuary for Master Artistry</h3>
                  <p className="about-story-p">
                    In a world where life's defining moments happen once, finding a certified makeup artist should never be an uncertain gamble. Lume connects clients directly with verified, vetted master artists with upfront pricing and authentic style alignment.
                  </p>
                  <div className="about-mobile-card-meta">
                    <span>✦ Certified Master Artists</span>
                    <span>✦ Zero Negotiation Drama</span>
                  </div>
                </div>
              </div>

              {/* Slide 1: The Atelier */}
              <div className={`about-mobile-slide ${activeStoryTab === 1 ? 'is-active' : 'is-hidden'}`}>
                <div className="about-mobile-card about-mobile-card--media">
                  <div className="about-story-frame">
                    <img src="/images/about/2.jpg" alt="Lume Artistry Studio" loading="eager" />
                    <div className="about-story-badge">
                      <Compass size={14} />
                      <span>Mumbai Atelier · Pan-India Vision</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: The Founder */}
              <div className={`about-mobile-slide ${activeStoryTab === 2 ? 'is-active' : 'is-hidden'}`}>
                <div className="about-mobile-card about-mobile-card--founder">
                  <blockquote className="about-story-quote">
                    <Quote size={20} className="about-story-quote-icon" />
                    <p>
                      “Getting your makeup done should never feel transactional. It should feel like stepping into your most radiant self—with complete trust.”
                    </p>
                    <cite>— Sahil Pawar, Founder & CEO</cite>
                  </blockquote>
                </div>
              </div>
            </div>

            <div className="about-mobile-controls">
              <button
                type="button"
                className="about-arrow-btn"
                onClick={() => setActiveStoryTab((prev) => (prev - 1 + 3) % 3)}
                aria-label="Previous story slide"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="about-dots">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`about-dot ${activeStoryTab === idx ? 'is-active' : ''}`}
                    onClick={() => setActiveStoryTab(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="about-arrow-btn"
                onClick={() => setActiveStoryTab((prev) => (prev + 1) % 3)}
                aria-label="Next story slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <span className="about-swipe-hint">Swipe left or right to read more</span>
          </div>
        </div>
      </section>

      {/* ── 3 Core Pillars ── */}
      <section className="about-pillars-section">
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-eyebrow">OUR THREE TENETS</span>
            <h2>Built on trust, <em>defined by artistry.</em></h2>
          </div>

          {/* Desktop Pillars Grid */}
          <div className="about-pillars-grid about-pillars-grid--desktop">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div className="about-pillar-card" key={idx}>
                  <div className="about-pillar-card__header">
                    <div className="about-pillar-card__icon-wrap">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <span className="about-pillar-card__tag">{pillar.tag}</span>
                  </div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Mobile Swipeable Pillars */}
          <div className="about-pillars-mobile">
            <div className="about-mobile-nav" role="tablist" aria-label="Tenet pills">
              {PILLARS.map((p, idx) => (
                <button
                  key={p.tag}
                  type="button"
                  className={`about-mobile-pill ${activePillarTab === idx ? 'is-active' : ''}`}
                  onClick={() => setActivePillarTab(idx)}
                >
                  {p.shortLabel}
                </button>
              ))}
            </div>

            <div
              className="about-mobile-deck"
              onTouchStart={handlePillarTouchStart}
              onTouchEnd={handlePillarTouchEnd}
            >
              {PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.tag}
                    className={`about-mobile-slide ${activePillarTab === idx ? 'is-active' : 'is-hidden'}`}
                  >
                    <div className="about-pillar-card">
                      <div className="about-pillar-card__header">
                        <div className="about-pillar-card__icon-wrap">
                          <Icon size={20} strokeWidth={1.8} />
                        </div>
                        <span className="about-pillar-card__tag">{pillar.tag}</span>
                      </div>
                      <h3>{pillar.title}</h3>
                      <p>{pillar.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="about-mobile-controls">
              <button
                type="button"
                className="about-arrow-btn"
                onClick={() => setActivePillarTab((prev) => (prev - 1 + PILLARS.length) % PILLARS.length)}
                aria-label="Previous tenet"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="about-dots">
                {PILLARS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`about-dot ${activePillarTab === idx ? 'is-active' : ''}`}
                    onClick={() => setActivePillarTab(idx)}
                    aria-label={`Go to tenet ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="about-arrow-btn"
                onClick={() => setActivePillarTab((prev) => (prev + 1) % PILLARS.length)}
                aria-label="Next tenet"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <span className="about-swipe-hint">Swipe to explore all 3 tenets</span>
          </div>
        </div>
      </section>

      {/* ── Clean Action Footer ── */}
      <section className="about-cta-section">
        <div className="about-container about-cta-inner">
          <div className="about-cta-content">
            <h2>Ready to experience beauty <em>the way it was meant to be?</em></h2>
            <p>Browse our directory of certified artists or explore our signature style aesthetics.</p>
          </div>
          <div className="about-cta-buttons">
            <Link to="/discover" className="about-cta-primary">
              Discover Artists <ArrowUpRight size={17} strokeWidth={2.4} />
            </Link>
            <Link to="/categories" className="about-cta-secondary">
              Explore All Styles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
