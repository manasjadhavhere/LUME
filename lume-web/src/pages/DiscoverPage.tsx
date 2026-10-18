import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  AlertCircle,
  Search,
  MapPin,
  BadgeCheck,
  Star,
  Heart,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  X,
  CheckCircle,
} from 'lucide-react';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import CategoryChips from '../components/home/CategoryChips';
import useFilterState from '../hooks/useFilterState';
import useFavorites from '../hooks/useFavorites';
import { API_BASE } from '../context/AuthContext';
import type { ServiceCategory } from '../data/types';
import useScrollReveal from '../hooks/useScrollReveal';
import './HomeEditorial.css';
import './DiscoverPage.css';

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

const mediaUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
};

const DiscoverPage: React.FC = () => {
  const location = useLocation();
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { isFavorite, toggleFavorite } = useFavorites();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'sort' | 'budget' | 'location' | 'experience'>('sort');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'UNDER_5K' | '5K_15K' | 'ABOVE_15K'>('ALL');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minExp, setMinExp] = useState(0);
  const [sortBy, setSortBy] = useState<'FEATURED' | 'RATING' | 'PRICE_ASC' | 'PRICE_DESC' | 'EXPERIENCE'>('FEATURED');

  useEffect(() => {
    if (filterDrawerOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setFilterDrawerOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [filterDrawerOpen]);

  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    locationQuery,
    setLocationQuery,
    clearFilterState,
  } = useFilterState();

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
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setArtists(data.data.artists);
        else setError(data.message || 'Failed to load artists');
      })
      .catch(() => setError('Network error. Please try again later.'))
      .finally(() => setIsLoading(false));
  }, [activeCategory, searchQuery, locationQuery]);

  const filteredArtists = useMemo(() => {
    let result = [...artists];
    if (onlyVerified) {
      result = result.filter((a) => a.isVerified);
    }
    if (priceFilter === 'UNDER_5K') {
      result = result.filter((a) => (a.startingPrice || 0) <= 5000);
    } else if (priceFilter === '5K_15K') {
      result = result.filter((a) => (a.startingPrice || 0) > 5000 && (a.startingPrice || 0) <= 15000);
    } else if (priceFilter === 'ABOVE_15K') {
      result = result.filter((a) => (a.startingPrice || 0) > 15000);
    }
    if (minExp > 0) {
      result = result.filter((a) => (Number(a.experience) || 0) >= minExp);
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

  const activeFilterCount =
    (onlyVerified ? 1 : 0) +
    (priceFilter !== 'ALL' ? 1 : 0) +
    (minExp > 0 ? 1 : 0) +
    (sortBy !== 'FEATURED' ? 1 : 0) +
    (Boolean(locationQuery.trim()) ? 1 : 0);

  const hasAnyFilterActive =
    activeCategory !== 'All' ||
    Boolean(searchQuery.trim()) ||
    Boolean(locationQuery.trim()) ||
    priceFilter !== 'ALL' ||
    onlyVerified ||
    minExp > 0 ||
    sortBy !== 'FEATURED';

  const resetAllFilters = () => {
    setPriceFilter('ALL');
    setOnlyVerified(false);
    setMinExp(0);
    setSortBy('FEATURED');
    clearFilterState();
  };

  return (
    <div className="discover-page">
      {/* ── Editorial Hero ── */}
      <section className="discover-hero">
        <div className="discover-hero__inner">
          <nav className="discover-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span>Discover Artists</span>
          </nav>

          <span className="discover-hero__eyebrow">
            <Sparkles size={16} /> A More Personal Kind of Beauty
          </span>

          <h1>
            Curated Artists. <em>Good hands, beautiful possibilities.</em>
          </h1>

          <p>
            Explore verified portfolios, compare specialties, and find the makeup artist tailored to your moment.
          </p>

          <div className="discover-trust-badges">
            <span className="discover-trust-badge">
              <CheckCircle size={14} color="var(--rose-deep)" /> 100% Verified Profiles
            </span>
            <span className="discover-trust-badge">
              <Star size={14} color="#f59e0b" fill="#f59e0b" /> Real Client Reviews
            </span>
            <span className="discover-trust-badge">
              <Sparkles size={14} color="var(--rose-deep)" /> Transparent Pricing
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <div className="discover-content">
        <div className="discover-content__inner">
          {/* ── Search & Filter Suite ── */}
          <div className="discover-search-suite reveal-up">
            <div className="discover-search-bar">
              <div className="discover-search-input">
                <Search size={18} className="discover-search-icon" />
                <input
                  type="text"
                  placeholder="Search by specialty, look, or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search artists"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="discover-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="discover-search-divider" />

              <div className="discover-search-input discover-search-input--loc">
                <LocationAutocomplete variant="filter"
                  value={locationQuery}
                  onChange={setLocationQuery}
                  icon={<MapPin size={18} className="discover-search-icon" />}
                  placeholder="Location (e.g. Mumbai, Delhi)"
                  className="lp-search-input--autocomplete"
                />
                {locationQuery && (
                  <button
                    type="button"
                    className="discover-search-clear"
                    onClick={() => setLocationQuery('')}
                    aria-label="Clear location"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`discover-filter-trigger ${filterDrawerOpen ? 'is-open' : ''} ${activeFilterCount > 0 ? 'has-active' : ''}`}
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                aria-expanded={filterDrawerOpen}
                aria-label="Toggle filter drawer"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="discover-filter-count-badge">{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* ── Slide-Over Ecommerce Filter Drawer (Unfolds from right) ── */}
          {filterDrawerOpen && (
            <div className="discover-filter-modal" role="dialog" aria-modal="true" aria-label="Filters">
              {/* Backdrop Overlay */}
              <div
                className="discover-filter-backdrop"
                onClick={() => setFilterDrawerOpen(false)}
                aria-hidden="true"
              />

              {/* Right Slide-in Panel */}
              <aside className="discover-filter-panel">
                {/* Header */}
                <div className="discover-filter-panel__header">
                  <div className="discover-filter-panel__title-wrap">
                    <SlidersHorizontal size={18} className="discover-filter-panel__icon" />
                    <h2 className="discover-filter-panel__title">Filter & Refine</h2>
                    {activeFilterCount > 0 && (
                      <span className="discover-filter-count-badge">{activeFilterCount}</span>
                    )}
                  </div>
                  <div className="discover-filter-panel__actions">
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        className="discover-filter-panel__reset-btn"
                        onClick={resetAllFilters}
                      >
                        <RotateCcw size={13} />
                        <span>Clear all</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="discover-filter-panel__close-btn"
                      onClick={() => setFilterDrawerOpen(false)}
                      aria-label="Close filters"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Split Two-Pane Body */}
                <div className="discover-filter-panel__body">
                  {/* Left Navigation Column */}
                  <nav className="discover-filter-tabs" aria-label="Filter categories">
                    <button
                      type="button"
                      className={`discover-filter-tab-btn ${filterTab === 'sort' ? 'is-active' : ''}`}
                      onClick={() => setFilterTab('sort')}
                    >
                      <span className="discover-filter-tab-text">Sort By</span>
                      {sortBy !== 'FEATURED' && <span className="discover-filter-tab-dot" />}
                    </button>

                    <button
                      type="button"
                      className={`discover-filter-tab-btn ${filterTab === 'budget' ? 'is-active' : ''}`}
                      onClick={() => setFilterTab('budget')}
                    >
                      <span className="discover-filter-tab-text">Budget</span>
                      {priceFilter !== 'ALL' && <span className="discover-filter-tab-dot" />}
                    </button>

                    <button
                      type="button"
                      className={`discover-filter-tab-btn ${filterTab === 'location' ? 'is-active' : ''}`}
                      onClick={() => setFilterTab('location')}
                    >
                      <span className="discover-filter-tab-text">Location</span>
                      {Boolean(locationQuery.trim()) && <span className="discover-filter-tab-dot" />}
                    </button>

                    <button
                      type="button"
                      className={`discover-filter-tab-btn ${filterTab === 'experience' ? 'is-active' : ''}`}
                      onClick={() => setFilterTab('experience')}
                    >
                      <span className="discover-filter-tab-text">Experience</span>
                      {(onlyVerified || minExp > 0) && <span className="discover-filter-tab-dot" />}
                    </button>
                  </nav>

                  {/* Right Content Pane - Unfolds options */}
                  <div className="discover-filter-content">
                    {/* 1. Sort By Tab */}
                    {filterTab === 'sort' && (
                      <div className="discover-filter-pane animate-fade-in">
                        <h3 className="discover-filter-pane__heading">Sort Artists By</h3>
                        <div className="discover-filter-options-list">
                          {[
                            { id: 'FEATURED', label: 'Curated (Recommended)', desc: 'Best match based on style & popularity' },
                            { id: 'RATING', label: 'Top Rated ★', desc: 'Highest client ratings first' },
                            { id: 'PRICE_ASC', label: 'Price: Low to High', desc: 'Starting price ascending' },
                            { id: 'PRICE_DESC', label: 'Price: High to Low', desc: 'Starting price descending' },
                            { id: 'EXPERIENCE', label: 'Most Experience', desc: 'Senior artists & specialists' },
                          ].map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className={`discover-filter-radio-row ${sortBy === s.id ? 'is-selected' : ''}`}
                              onClick={() => setSortBy(s.id as any)}
                            >
                              <div className="discover-filter-radio-indicator">
                                {sortBy === s.id && <span className="discover-filter-radio-dot" />}
                              </div>
                              <div className="discover-filter-radio-meta">
                                <span className="discover-filter-radio-title">{s.label}</span>
                                <span className="discover-filter-radio-desc">{s.desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Budget Tab */}
                    {filterTab === 'budget' && (
                      <div className="discover-filter-pane animate-fade-in">
                        <h3 className="discover-filter-pane__heading">Price Range</h3>
                        <div className="discover-filter-options-list">
                          {[
                            { id: 'ALL', label: 'Any Budget', desc: 'Show all pricing tiers' },
                            { id: 'UNDER_5K', label: 'Under ₹5,000', desc: 'Budget-friendly artistry' },
                            { id: '5K_15K', label: '₹5,000 – ₹15,000', desc: 'Most popular range' },
                            { id: 'ABOVE_15K', label: '₹15,000 & Above', desc: 'Bridal & luxury specialists' },
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className={`discover-filter-radio-row ${priceFilter === p.id ? 'is-selected' : ''}`}
                              onClick={() => setPriceFilter(p.id as any)}
                            >
                              <div className="discover-filter-radio-indicator">
                                {priceFilter === p.id && <span className="discover-filter-radio-dot" />}
                              </div>
                              <div className="discover-filter-radio-meta">
                                <span className="discover-filter-radio-title">{p.label}</span>
                                <span className="discover-filter-radio-desc">{p.desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Location Tab */}
                    {filterTab === 'location' && (
                      <div className="discover-filter-pane animate-fade-in">
                        <h3 className="discover-filter-pane__heading">City / Location</h3>
                        <div className="discover-filter-loc-box">
                          <LocationAutocomplete variant="filter"
                            value={locationQuery}
                            onChange={setLocationQuery}
                            icon={<MapPin size={16} className="discover-search-icon" />}
                            placeholder="Search city (e.g. Mumbai, Delhi, Bengaluru)"
                            className="lp-search-input--autocomplete"
                          />
                          {locationQuery && (
                            <button
                              type="button"
                              className="discover-search-clear"
                              onClick={() => setLocationQuery('')}
                              aria-label="Clear location"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        <div className="discover-filter-popular-cities">
                          <span className="discover-filter-sublabel">Popular Cities</span>
                          <div className="discover-filter-city-chips">
                            {['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Jaipur', 'Goa'].map((city) => (
                              <button
                                key={city}
                                type="button"
                                className={`discover-city-chip ${locationQuery.toLowerCase() === city.toLowerCase() ? 'is-selected' : ''}`}
                                onClick={() => setLocationQuery(locationQuery.toLowerCase() === city.toLowerCase() ? '' : city)}
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Experience & Verification Tab */}
                    {filterTab === 'experience' && (
                      <div className="discover-filter-pane animate-fade-in">
                        <h3 className="discover-filter-pane__heading">Verification</h3>
                        <div
                          className={`discover-filter-toggle-card ${onlyVerified ? 'is-active' : ''}`}
                          onClick={() => setOnlyVerified(!onlyVerified)}
                          role="checkbox"
                          aria-checked={onlyVerified}
                          tabIndex={0}
                        >
                          <div className="discover-filter-toggle-content">
                            <span className="discover-filter-toggle-title">Verified Artists Only</span>
                            <span className="discover-filter-toggle-sub">100% vetted portfolio & identity</span>
                          </div>
                          <div className={`discover-filter-switch ${onlyVerified ? 'is-on' : ''}`}>
                            <div className="discover-filter-switch-thumb" />
                          </div>
                        </div>

                        <h3 className="discover-filter-pane__heading" style={{ marginTop: '24px' }}>Years in Industry</h3>
                        <div className="discover-filter-options-list">
                          {[
                            { exp: 0, label: 'Any Experience', desc: 'All certified artists' },
                            { exp: 3, label: '3+ Years', desc: 'Established track record' },
                            { exp: 5, label: '5+ Years', desc: 'Seasoned master artists' },
                          ].map((e) => (
                            <button
                              key={e.exp}
                              type="button"
                              className={`discover-filter-radio-row ${minExp === e.exp ? 'is-selected' : ''}`}
                              onClick={() => setMinExp(e.exp)}
                            >
                              <div className="discover-filter-radio-indicator">
                                {minExp === e.exp && <span className="discover-filter-radio-dot" />}
                              </div>
                              <div className="discover-filter-radio-meta">
                                <span className="discover-filter-radio-title">{e.label}</span>
                                <span className="discover-filter-radio-desc">{e.desc}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sticky Bottom Footer */}
                <div className="discover-filter-panel__footer">
                  <button
                    type="button"
                    className="discover-filter-panel__footer-reset"
                    onClick={resetAllFilters}
                    disabled={!hasAnyFilterActive}
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    className="discover-filter-panel__apply-btn"
                    onClick={() => setFilterDrawerOpen(false)}
                  >
                    Show {filteredArtists.length} {filteredArtists.length === 1 ? 'Artist' : 'Artists'}
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* ── Filter Categories Shelf ── */}
          <div className="discover-categories-wrap reveal-up">
            <CategoryChips
              categories={DISCOVER_CATEGORIES}
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
            />
          </div>

          {/* ── Results Info & Active Filter Badges ── */}
          <div className="discover-results-bar">
            <div className="discover-results-summary">
              <p className="discover-results-count">
                {isLoading ? (
                  'Searching artists...'
                ) : (
                  <>
                    Showing <strong>{filteredArtists.length}</strong> {filteredArtists.length === 1 ? 'artist' : 'artists'}
                    {activeCategory !== 'All' && <span className="discover-results-sub"> in {activeCategory}</span>}
                  </>
                )}
              </p>
            </div>

            {hasAnyFilterActive && (
              <div className="discover-active-pills">
                {activeCategory !== 'All' && (
                  <span className="discover-active-pill">
                    {activeCategory}
                    <button type="button" onClick={() => setActiveCategory('All')} aria-label="Remove category filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="discover-active-pill">
                    "{searchQuery.trim()}"
                    <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {locationQuery.trim() && (
                  <span className="discover-active-pill">
                    📍 {locationQuery.trim()}
                    <button type="button" onClick={() => setLocationQuery('')} aria-label="Clear location">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {priceFilter !== 'ALL' && (
                  <span className="discover-active-pill">
                    {priceFilter === 'UNDER_5K' ? 'Under ₹5k' : priceFilter === '5K_15K' ? '₹5k – ₹15k' : '₹15k+'}
                    <button type="button" onClick={() => setPriceFilter('ALL')} aria-label="Clear price filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {onlyVerified && (
                  <span className="discover-active-pill">
                    Verified Only
                    <button type="button" onClick={() => setOnlyVerified(false)} aria-label="Remove verified filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {minExp > 0 && (
                  <span className="discover-active-pill">
                    {minExp}+ Yrs Exp
                    <button type="button" onClick={() => setMinExp(0)} aria-label="Clear exp filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button type="button" className="discover-clear-all-btn" onClick={resetAllFilters}>
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && !isLoading && (
            <div className="discover-error-banner">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Artists Grid */}
          {isLoading ? (
            <div className="discover-page__artists-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="home-artist-skeleton" key={`skeleton-${index}`} />
              ))}
            </div>
          ) : filteredArtists.length > 0 ? (
            <div className="discover-page__artists-grid stagger">
              {filteredArtists.map((artist, index) => {
                const photo = artist.profileImageUrl || artist.user?.avatarUrl;
                const imgUrl = photo ? mediaUrl(photo) : ASSET_IMAGES[index % ASSET_IMAGES.length];
                const artistName = artist.user?.name || 'Artist';
                const specialties: string[] = artist.specialties?.length ? artist.specialties : ['Artistry'];
                const startingPrice = Number(artist.startingPrice) || 0;

                return (
                  <article className="home-artist" key={artist.id}>
                    <div className="home-artist__media">
                      <Link
                        to={`/artist/${artist.id}`}
                        className="home-artist__image"
                        aria-label={`View ${artistName}'s profile`}
                      >
                        <img
                          src={imgUrl}
                          alt={artistName}
                          loading="lazy"
                          onError={(e) => handleImageFallback(e, index)}
                        />
                        {artist.isVerified && (
                          <span className="home-artist__verified">
                            <BadgeCheck size={14} /> Verified
                          </span>
                        )}
                      </Link>
                      <button
                        className={`home-artist__save ${isFavorite(artist.id) ? 'is-saved' : ''}`}
                        type="button"
                        aria-label={`${isFavorite(artist.id) ? 'Unsave' : 'Save'} ${artistName}`}
                        aria-pressed={isFavorite(artist.id)}
                        onClick={() => toggleFavorite(artist.id)}
                      >
                        <Heart size={18} fill={isFavorite(artist.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="home-artist__body">
                      <div className="home-artist__title">
                        <h3>
                          <Link to={`/artist/${artist.id}`}>{artistName}</Link>
                        </h3>
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
                        {specialties.slice(0, 2).map((spec: string) => (
                          <span key={spec} className="home-artist__tag">{spec}</span>
                        ))}
                        {specialties.length > 2 && (
                          <span className="home-artist__tag home-artist__tag--more">+{specialties.length - 2}</span>
                        )}
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
                          <strong className="home-artist__price-val">₹{startingPrice.toLocaleString('en-IN')}</strong>
                        </div>
                        <Link
                          to={`/artist/${artist.id}`}
                          className="home-artist__action"
                          aria-label={`Explore ${artistName}`}
                        >
                          <ArrowUpRight size={18} strokeWidth={2.4} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : !error ? (
            <div className="discover-page__empty-state">
              <div className="discover-empty-icon-wrap">
                <Sparkles size={28} />
              </div>
              <h3 className="discover-page__empty-title">No Artists Found</h3>
              <p className="discover-page__empty-message">
                We couldn't find any artists matching your active filters.<br />
                Try clearing your search terms or choosing another category.
              </p>
              <button
                type="button"
                className="discover-page__reset-btn"
                onClick={resetAllFilters}
              >
                <RotateCcw size={16} /> Reset All Filters
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;