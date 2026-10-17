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
} from 'lucide-react';
import './AboutPage.css';

const PILLARS = [
  {
    icon: ShieldCheck,
    tag: 'TENET 01',
    title: 'Certified Mastery',
    desc: 'Every artist on Lume undergoes stringent verification for technical mastery, portfolio authenticity, and hygiene standards.'
  },
  {
    icon: Palette,
    tag: 'TENET 02',
    title: 'Style-First Alignment',
    desc: 'Browse portfolios organized by signature aesthetics so you connect with the artist whose hand naturally speaks your style.'
  },
  {
    icon: Gem,
    tag: 'TENET 03',
    title: 'Radical Transparency',
    desc: 'No vague negotiations or hidden fees. Upfront pricing, verified reviews, and secure instant reservations.'
  }
];

export default function AboutPage() {
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

      {/* ── Consolidated Story Card ── */}
      <section className="about-story-section">
        <div className="about-container">
          <div className="about-story-card">
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
        </div>
      </section>

      {/* ── 3 Core Pillars (Compact Row) ── */}
      <section className="about-pillars-section">
        <div className="about-container">
          <div className="about-pillars-grid">
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
        </div>
      </section>

      {/* ── Clean Action Footer ── */}
      <section className="about-cta-section">
        <div className="about-container about-cta-inner">
          <div className="about-cta-content">
            <h2>Ready to experience beauty <em>the way it was meant to be?</em></h2>
            <p>Browse our directory of certified artists or explore our 8 signature style aesthetics.</p>
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
