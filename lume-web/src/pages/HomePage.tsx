import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Heart, Shield, Clock, Sparkles, CheckCircle } from 'lucide-react';
import useScrollPosition from '../hooks/useScrollPosition';
import useFilterState from '../hooks/useFilterState';
import ArtistCard from '../components/home/ArtistCard';
import ArtistCardSkeleton from '../components/home/ArtistCardSkeleton';
import CategoryChips from '../components/home/CategoryChips';
import HeroBanner from '../components/home/HeroBanner';
import { filterArtistsByCategory } from '../data/demoData';
import type { ServiceCategory } from '../data/types';
import './HomePage.css';

const HOME_CATEGORIES: Array<{ id: ServiceCategory; icon: string; image?: string; label: string }> = [
  { id: 'All', icon: '✨', label: 'All' },
  { id: 'Bridal', icon: '👰', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Bridal' },
  { id: 'Editorial', icon: '📸', image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Editorial' },
  { id: 'Evening', icon: '🌆', image: 'https://images.unsplash.com/photo-1566977755106-4b9ee5625c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Evening' },
  { id: 'Natural', icon: '🌿', image: 'https://images.unsplash.com/photo-1512413914583-11bf279a016f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Natural' },
  { id: 'Glam', icon: '💫', image: 'https://images.unsplash.com/photo-1516975080661-460d3d256877?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Glam' },
];

const ABOUT_STATS = [
  { n: '500+', l: 'Expert Artists' },
  { n: '50K+', l: 'Happy Clients' },
  { n: '4.9★', l: 'Avg Rating' },
  { n: '15+', l: 'Cities' },
];

const CATEGORY_TILES = [
  { name: 'Bridal', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '120+ Artists' },
  { name: 'Editorial', image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '85+ Artists' },
  { name: 'Evening Glam', image: 'https://images.unsplash.com/photo-1566977755106-4b9ee5625c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '95+ Artists' },
  { name: 'Natural', image: 'https://images.unsplash.com/photo-1512413914583-11bf279a016f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '110+ Artists' },
  { name: 'Fantasy & Bold', image: 'https://images.unsplash.com/photo-1516975080661-460d3d256877?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', count: '45+ Artists' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  useScrollPosition(true);
  const { activeCategory, setActiveCategory, searchQuery } = useFilterState();

  const filteredArtists = useMemo(() => {
    const base = filterArtistsByCategory(activeCategory);
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.specialties.some(s => s.toLowerCase().includes(q)) ||
      a.location.toLowerCase().includes(q)
    );
  }, [activeCategory, searchQuery]);

  return (
    <div className="home-page">

      {/* ── 1. HERO SLIDESHOW ── */}
      <HeroBanner onCtaClick={() => navigate('/discover')} />

      {/* ── 2. OUR ARTISTS ── */}
      <section className="home-section home-artists" id="artists">
        <div className="home-container">
          <div className="home-section-header reveal">
            <span className="home-eyebrow">Our Artists</span>
            <h2 className="home-heading">Featured <em>Beauty Artists</em></h2>
          </div>

          {/* Category filter */}
          <div className="home-artists__filter reveal">
            <CategoryChips
              categories={HOME_CATEGORIES}
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
            />
          </div>

          {isLoading ? (
            <div className="home-artists__grid">
              {Array.from({ length: 4 }).map((_, i) => <ArtistCardSkeleton key={i} />)}
            </div>
          ) : filteredArtists.length > 0 ? (
            <div className="home-artists__grid stagger">
              {filteredArtists.map(artist => (
                <div key={artist.id} className="reveal-scale">
                  <ArtistCard artist={artist} onClick={id => navigate(`/artist/${id}`)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="home-empty reveal">
              <Search size={40} className="home-empty__icon" />
              <p>No artists match your search. Try different keywords or browse all.</p>
              <button className="home-empty__reset" onClick={() => setActiveCategory('All')}>Reset filters</button>
            </div>
          )}

          <div className="home-section-more reveal">
            <button className="home-btn home-btn--outline" onClick={() => navigate('/discover')}>
              View All Artists <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT US ── */}
      <section className="home-section home-about" id="about">
        <div className="home-container home-about__grid">
          <div className="home-about__visual reveal-left">
            <div className="home-about__img-stack">
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80"
                alt="Beauty artist at work"
                className="home-about__img home-about__img--main"
                loading="lazy"
              />
              <img
                src="https://images.unsplash.com/photo-1508214751196-bfd140925c41?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Makeup detail"
                className="home-about__img home-about__img--accent"
                loading="lazy"
              />
              <div className="home-about__float-badge">
                <Sparkles size={18} />
                <span>India's #1 Platform</span>
              </div>
            </div>
          </div>

          <div className="home-about__text reveal-right">
            <span className="home-eyebrow">About Lume</span>
            <h2 className="home-heading">Where Beauty Meets <em>Artistry</em></h2>
            <p className="home-about__body">
              Lume connects clients with India's most talented, verified makeup artists. Every artist on the platform is hand-vetted, portfolio-reviewed, and backed by authentic reviews — so you always book with confidence.
            </p>

            <div className="home-about__stats stagger">
              {ABOUT_STATS.map(s => (
                <div key={s.l} className="home-about__stat reveal">
                  <strong>{s.n}</strong>
                  <span>{s.l}</span>
                </div>
              ))}
            </div>

            <div className="home-about__trust">
              {[
                { icon: Shield, text: '100% Verified Artists' },
                { icon: Heart, text: 'Personalized Matching' },
                { icon: Clock, text: 'Instant Booking' },
                { icon: CheckCircle, text: 'Authentic Reviews' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="home-about__trust-item">
                  <Icon size={15} /> {text}
                </div>
              ))}
            </div>

            <button className="home-btn home-btn--primary" onClick={() => navigate('/discover')}>
              Explore Artists <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. CATEGORIES ── */}
      <section className="home-section home-categories" id="categories">
        <div className="home-container">
          <div className="home-section-header reveal">
            <span className="home-eyebrow">Browse by Style</span>
            <h2 className="home-heading">Find the Perfect Look <em>For Every Occasion</em></h2>
          </div>

          <div className="home-cat-grid stagger">
            {CATEGORY_TILES.map((cat, i) => (
              <div
                key={cat.name}
                className={`home-cat-card reveal-scale ${i === 0 ? 'home-cat-card--wide' : ''}`}
                onClick={() => navigate('/discover')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate('/discover')}
              >
                <img src={cat.image} alt={cat.name} className="home-cat-card__img" loading="lazy" />
                <div className="home-cat-card__overlay" />
                <div className="home-cat-card__info">
                  <h3>{cat.name}</h3>
                  <span>{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PARTNER WITH US ── */}
      <section className="home-section home-partner" id="partner">
        <div className="home-partner__bg" />
        <div className="home-container home-partner__inner">
          <div className="home-partner__content reveal">
            <span className="home-eyebrow home-eyebrow--light">For Artists</span>
            <h2 className="home-heading home-heading--light">Are You a Makeup Artist? <em>Join Lume</em></h2>
            <p className="home-partner__sub">
              Grow your clientele, manage bookings, and showcase your portfolio to thousands of clients actively looking for your expertise. Free to join.
            </p>
            <div className="home-partner__perks stagger">
              {['Free Profile Listing', 'Verified Artist Badge', 'Secure Payments', '24/7 Support'].map(perk => (
                <div key={perk} className="home-partner__perk">
                  <CheckCircle size={16} /> {perk}
                </div>
              ))}
            </div>
            <button className="home-btn home-btn--light home-partner__cta">
              Apply to Join <ArrowRight size={16} />
            </button>
          </div>

          <div className="home-partner__visual reveal-right">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Beauty artist"
              className="home-partner__img"
              loading="lazy"
            />
            <div className="home-partner__stat glass">
              <strong>500+</strong>
              <span>Artists on Lume</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CONTACT / CTA ── */}
      <section className="home-section home-cta" id="contact">
        <div className="home-container">
          <div className="home-cta__inner reveal">
            <Sparkles className="home-cta__icon" size={40} />
            <h2 className="home-heading">Ready to Discover <em>Your Glow?</em></h2>
            <p className="home-cta__sub">
              Join over 50,000 satisfied clients who trust Lume for their beauty needs.
            </p>
            <div className="home-cta__btns">
              <button className="home-btn home-btn--primary" onClick={() => navigate('/home')}>
                Book an Artist <ArrowRight size={16} />
              </button>
              <button className="home-btn home-btn--outline-white" onClick={() => navigate('/discover')}>
                Browse Artists
              </button>
            </div>
            <p className="home-cta__note">✓ Secure Booking · ✓ Verified Professionals · ✓ Instant Confirmation</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
