import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Search, MapPin, Filter, ArrowRight, CheckCircle, Star, Heart, RotateCcw, SlidersHorizontal } from 'lucide-react';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import CategoryChips from '../components/home/CategoryChips';
import ArtistCardSkeleton from '../components/home/ArtistCardSkeleton';
import useFilterState from '../hooks/useFilterState';
import useFavorites from '../hooks/useFavorites';
import { API_BASE } from '../context/AuthContext';
import type { ServiceCategory } from '../data/types';
import useScrollReveal from '../hooks/useScrollReveal';
import './DiscoverPage.css';
import './LandingPage.css';

import img1 from '../assets/images/1.png';
import img2 from '../assets/images/2.png';
import img3 from '../assets/images/3.png';
import img4 from '../assets/images/4.png';
import img5 from '../assets/images/5.png';
import img6 from '../assets/images/6.png';
import img7 from '../assets/images/7.png';

const DISCOVER_CATEGORIES: Array<{ id: ServiceCategory; icon?: string; image?: string; label: string }> = [
  { id: 'All', image: '/images/categories/natural.jpg', label: 'All' },
  { id: 'Bridal', image: '/images/categories/bridal.jpg', label: 'Bridal' },
  { id: 'Editorial', image: '/images/categories/editorial.jpg', label: 'Editorial' },
  { id: 'Natural', image: '/images/categories/natural.jpg', label: 'Natural' },
  { id: 'Fantasy', image: '/images/categories/fantasy.jpg', label: 'Fantasy' },
  { id: 'Festive', image: '/images/categories/festive.jpg', label: 'Festive' },
  { id: 'Glamour', image: '/images/categories/glamour.jpg', label: 'Glamour' },
  { id: 'SFX', image: '/images/categories/sfx.jpg', label: 'SFX' },
  { id: 'Party', image: '/images/categories/party.jpg', label: 'Party' },
];

const ASSET_IMAGES = [img1, img2, img3, img4, img5, img6, img7];

const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>, index = 0) => {
  const target = e.currentTarget;
  const fallback = ASSET_IMAGES[index % ASSET_IMAGES.length];
  if (target.src !== fallback) {
    target.src = fallback;
  }
};

const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { isFavorite, toggleFavorite } = useFavorites();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'UNDER_5K' | '5K_15K' | 'ABOVE_15K'>('ALL');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minExp, setMinExp] = useState(0);
  const [sortBy, setSortBy] = useState<'FEATURED' | 'RATING' | 'PRICE_ASC' | 'PRICE_DESC' | 'EXPERIENCE'>('FEATURED');

  const { activeCategory, setActiveCategory, searchQuery, setSearchQuery, locationQuery, setLocationQuery, clearFilterState } = useFilterState();
  useScrollReveal([artists, isLoading]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1);
      setActiveCategory(formattedCat as ServiceCategory);
    }
    const loc = params.get('location');
    if (loc) setLocationQuery(loc);
    const srv = params.get('service');
    if (srv) setSearchQuery(srv);
  }, [location.search, setActiveCategory, setLocationQuery, setSearchQuery]);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    const queryParams = new URLSearchParams();
    if (activeCategory !== 'All') queryParams.append('specialty', activeCategory);
    if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
    if (locationQuery.trim()) queryParams.append('location', locationQuery.trim());

    fetch(`${API_BASE}/api/artists?${queryParams.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setArtists(data.data.artists);
        else setError(data.message || 'Failed to load artists');
      })
      .catch(() => setError('Network error. Please try again later.'))
      .finally(() => setIsLoading(false));
  }, [activeCategory, searchQuery, locationQuery]);

  const handleArtistClick = (id: string) => {
    navigate(`/artist/${id}`);
  };

  const filteredArtists = useMemo(() => {
    let result = [...artists];
    if (onlyVerified) {
      result = result.filter(a => a.isVerified);
    }
    if (priceFilter === 'UNDER_5K') {
      result = result.filter(a => (a.startingPrice || 0) <= 5000);
    } else if (priceFilter === '5K_15K') {
      result = result.filter(a => (a.startingPrice || 0) > 5000 && (a.startingPrice || 0) <= 15000);
    } else if (priceFilter === 'ABOVE_15K') {
      result = result.filter(a => (a.startingPrice || 0) > 15000);
    }
    if (minExp > 0) {
      result = result.filter(a => (Number(a.experience) || 0) >= minExp);
    }
    if (sortBy === 'RATING') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
    } else if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
    } else if (sortBy === 'EXPERIENCE') {
      result.sort((a, b) => (Number(b.experience) || 0) - (Number(a.experience) || 0));
    }
    return result;
  }, [artists, onlyVerified, priceFilter, minExp, sortBy]);

  const activeFilterCount = (onlyVerified ? 1 : 0) + (priceFilter !== 'ALL' ? 1 : 0) + (minExp > 0 ? 1 : 0) + (sortBy !== 'FEATURED' ? 1 : 0);

  const resetAllFilters = () => {
    setPriceFilter('ALL');
    setOnlyVerified(false);
    setMinExp(0);
    setSortBy('FEATURED');
    clearFilterState();
  };

  return (
    <div className="discover-page">
      <div className="lp-container">
        {/* Header */}
        <div className="lp-section__header reveal" style={{ marginTop: '0', marginBottom: '40px' }}>
          <h1 className="lp-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', whiteSpace: 'nowrap' }}>
            <span style={{ height: '1px', background: 'var(--text-soft)', flex: 1, maxWidth: '60px' }}></span>
            Discover Artists
            <span style={{ height: '1px', background: 'var(--text-soft)', flex: 1, maxWidth: '60px' }}></span>
          </h1>
          <p className="discover-page__subtitle" style={{ marginTop: '16px' }}>
            Find the perfect makeup artist for any occasion
          </p>
        </div>

      {/* Search Bar */}
      <div className="reveal-up" style={{ maxWidth: '740px', margin: '0 auto', transitionDelay: '0.1s' }}>
        <div className="lp-search-box glass-panel" style={{ background: 'var(--white)' }}>
          <div className="lp-search-input">
            <Search size={18} className="lp-search-icon" />
            <input 
              type="text" 
              placeholder="Service (e.g. Bridal HD, Airbrush)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="lp-search-divider" />
          <div className="lp-search-input" style={{ padding: 0 }}>
            <LocationAutocomplete 
              value={locationQuery} 
              onChange={setLocationQuery} 
              icon={<MapPin size={18} className="lp-search-icon" />}
              className="lp-search-input--autocomplete"
            />
          </div>
          <button
            className={`lp-btn lp-search-btn ${filterDrawerOpen ? 'lp-btn--dark' : 'lp-btn--primary'}`}
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="discover-filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Expandable Luxury Filter Drawer */}
        {filterDrawerOpen && (
          <div className="discover-filter-drawer">
            <div className="discover-filter-drawer__header">
              <span className="discover-filter-drawer__title">
                <SlidersHorizontal size={16} /> Refine Artists
              </span>
              {activeFilterCount > 0 && (
                <button type="button" className="discover-filter-drawer__reset" onClick={resetAllFilters}>
                  <RotateCcw size={13} /> Reset Filters
                </button>
              )}
            </div>

            <div className="discover-filter-drawer__grid">
              {/* Sort By */}
              <div className="discover-filter-group">
                <label className="discover-filter-label">Sort By</label>
                <div className="discover-filter-chips">
                  {[
                    { id: 'FEATURED', label: 'Curated' },
                    { id: 'RATING', label: 'Top Rated ★' },
                    { id: 'PRICE_ASC', label: 'Price: Low-High' },
                    { id: 'PRICE_DESC', label: 'Price: High-Low' },
                    { id: 'EXPERIENCE', label: 'Most Experience' },
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={`discover-chip ${sortBy === s.id ? 'is-active' : ''}`}
                      onClick={() => setSortBy(s.id as any)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="discover-filter-group">
                <label className="discover-filter-label">Budget Range</label>
                <div className="discover-filter-chips">
                  {[
                    { id: 'ALL', label: 'Any Budget' },
                    { id: 'UNDER_5K', label: 'Under ₹5,000' },
                    { id: '5K_15K', label: '₹5,000 – ₹15,000' },
                    { id: 'ABOVE_15K', label: '₹15,000+' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`discover-chip ${priceFilter === p.id ? 'is-active' : ''}`}
                      onClick={() => setPriceFilter(p.id as any)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified & Experience */}
              <div className="discover-filter-group">
                <label className="discover-filter-label">Verification & Experience</label>
                <div className="discover-filter-chips">
                  <button
                    type="button"
                    className={`discover-chip ${onlyVerified ? 'is-active' : ''}`}
                    onClick={() => setOnlyVerified(!onlyVerified)}
                  >
                    ✓ Verified Artists Only
                  </button>
                  {[
                    { exp: 0, label: 'Any Exp' },
                    { exp: 3, label: '3+ Yrs' },
                    { exp: 5, label: '5+ Yrs' },
                  ].map(e => (
                    <button
                      key={e.exp}
                      type="button"
                      className={`discover-chip ${minExp === e.exp ? 'is-active' : ''}`}
                      onClick={() => setMinExp(e.exp)}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Categories */}
      <div className="discover-page__filters reveal-up" style={{ transitionDelay: '0.1s' }}>
        <CategoryChips
          categories={DISCOVER_CATEGORIES}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
        />
      </div>

      {/* Results Count */}
      <div className="discover-page__results-info">
        <p className="discover-page__results-count">
          {isLoading ? 'Loading...' : `${filteredArtists.length} ${filteredArtists.length === 1 ? 'artist' : 'artists'} available`}
        </p>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#dc2626', borderRadius: 12, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* Artists Grid */}
      {isLoading ? (
        <div className="discover-page__artists-grid stagger" style={{ marginTop: '32px' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="reveal-scale" key={`skeleton-${index}`}>
              <ArtistCardSkeleton />
            </div>
          ))}
        </div>
      ) : filteredArtists.length > 0 ? (
        <div className="discover-page__artists-grid stagger" style={{ marginTop: '32px' }}>
          {filteredArtists.map((artist) => {
            const rawImg = artist.profileImageUrl || artist.user?.avatarUrl;
            const imgUrl = rawImg ? (rawImg.startsWith('/') ? `${API_BASE}${rawImg}` : rawImg) : ASSET_IMAGES[1];
            
            // Format data exactly like LandingPage
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
                key={artist.id}
                className="lp-artist-card"
                onClick={() => handleArtistClick(artist.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleArtistClick(artist.id)}
              >
                <div className="lp-artist-card__img-wrap">
                  <img src={imgUrl} alt={artist.user?.name || 'Artist'} className="lp-artist-card__img" loading="lazy" onError={(e) => handleImageFallback(e, 1)} />
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

                  <button
                    type="button"
                    className={`lp-artist-card__fav-btn ${isFavorite(artist.id) ? 'is-fav' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(artist.id);
                    }}
                    aria-label={isFavorite(artist.id) ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <Heart size={14} fill={isFavorite(artist.id) ? 'currentColor' : 'none'} />
                  </button>

                  <div className="lp-artist-card__cover">
                    <h3 className="lp-artist-card__name">{artist.user?.name || 'Artist'}</h3>
                    <span className="lp-artist-card__location">
                      <MapPin size={12} /> <span>{artist.location || 'India'}</span>
                    </span>
                  </div>
                </div>

                <div className="lp-artist-card__info">
                  <div className="lp-artist-card__highlight">
                    <Star size={14} style={{ display: 'none' }} />
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
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : !error ? (
        <div className="discover-page__empty-state">
          <div className="discover-page__empty-icon">🔍</div>
          <h3 className="discover-page__empty-title">No Artists Match Criteria</h3>
          <p className="discover-page__empty-message">
            No artists match your active filter settings.<br />
            Try clearing filters or selecting another category.
          </p>
          <button
            className="discover-page__reset-btn"
            onClick={resetAllFilters}
          >
            Reset All Filters
          </button>
        </div>
      ) : null}
      </div>
    </div>
  );
};

export default DiscoverPage;