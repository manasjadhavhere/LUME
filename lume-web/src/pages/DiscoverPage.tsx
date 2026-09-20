import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Search, MapPin, Filter, ArrowRight, CheckCircle, Star } from 'lucide-react';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import CategoryChips from '../components/home/CategoryChips';
import ArtistCardSkeleton from '../components/home/ArtistCardSkeleton';
import useFilterState from '../hooks/useFilterState';
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
  { id: 'All', image: img1, label: 'All' },
  { id: 'Bridal', image: img2, label: 'Bridal' },
  { id: 'Editorial', image: img3, label: 'Editorial' },
  { id: 'Natural', image: img4, label: 'Natural' },
  { id: 'Fantasy', image: img5, label: 'Fantasy' },
  { id: 'Festive', image: img6, label: 'Festive' },
  { id: 'Glamour', image: img7, label: 'Glamour' },
  { id: 'SFX', image: img1, label: 'SFX' },
  { id: 'Party', image: img2, label: 'Party' },
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

  const handleFilter = () => {
    console.log('Advanced filters - coming soon!');
  };

  return (
    <div className="discover-page lp-section">
      <div className="lp-container">
        {/* Header */}
        <div className="lp-section__header reveal" style={{ marginTop: '20px', marginBottom: '40px' }}>
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
      <div className="reveal-up" style={{ maxWidth: '700px', margin: '0 auto', transitionDelay: '0.1s' }}>
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
          <button className="lp-btn lp-btn--primary lp-search-btn" onClick={handleFilter}>
             <Filter size={16} /> Filters
          </button>
        </div>
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
          {isLoading ? 'Loading...' : `${artists.length} ${artists.length === 1 ? 'artist' : 'artists'} found`}
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
        <div className="lp-artists__grid stagger" style={{ marginTop: '32px' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="reveal-scale" key={`skeleton-${index}`}>
              <ArtistCardSkeleton />
            </div>
          ))}
        </div>
      ) : artists.length > 0 ? (
        <div className="lp-artists__grid stagger" style={{ marginTop: '32px' }}>
          {artists.map((artist) => {
            const rawImg = artist.profileImageUrl || artist.user?.avatarUrl;
            const imgUrl = rawImg ? (rawImg.startsWith('/') ? `${API_BASE}${rawImg}` : rawImg) : ASSET_IMAGES[1];
            return (
              <div
                key={artist.id}
                className="lp-artist-card reveal-scale"
                onClick={() => handleArtistClick(artist.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleArtistClick(artist.id)}
              >
                <div className="lp-artist-card__img-wrap">
                  <img src={imgUrl} alt={artist.user?.name || 'Artist'} className="lp-artist-card__img" loading="lazy" onError={(e) => handleImageFallback(e, 1)} />
                  <div className="lp-artist-card__overlay">
                    <button className="lp-artist-card__view" onClick={() => handleArtistClick(artist.id)}>
                      View Profile <ArrowRight size={14} />
                    </button>
                  </div>
                  {artist.isVerified && (
                    <span className="lp-artist-card__badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={12} /> Verified
                    </span>
                  )}
                  <div className="lp-artist-card__rating-chip">
                    <Star size={10} fill="currentColor" /> {artist.rating?.toFixed(1) || '0.0'}
                  </div>
                </div>
                <div className="lp-artist-card__info">
                  <div className="lp-artist-card__meta">
                    <h3 className="lp-artist-card__name">{artist.user?.name || 'Unknown Artist'}</h3>
                  </div>
                  <p className="lp-artist-card__specialty">{artist.specialties?.length ? artist.specialties.join(' · ') : 'Makeup Artist'}</p>
                  <div className="lp-artist-card__footer">
                    <span className="lp-artist-card__location">
                      <MapPin size={11} /> {artist.location || 'Location'}
                    </span>
                    <span className="lp-artist-card__price">from ₹{(artist.startingPrice || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !error ? (
        <div className="discover-page__empty-state">
          <div className="discover-page__empty-icon">🔍</div>
          <h3 className="discover-page__empty-title">No Artists Found</h3>
          <p className="discover-page__empty-message">
            No artists match your current search and filters.<br />
            Try adjusting your criteria or browse all categories.
          </p>
          <button
            className="discover-page__reset-btn"
            onClick={clearFilterState}
          >
            Reset Filters
          </button>
        </div>
      ) : null}
      </div>
    </div>
  );
};

export default DiscoverPage;