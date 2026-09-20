import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import SearchBar from '../components/home/SearchBar';
import CategoryChips from '../components/home/CategoryChips';
import ArtistCard from '../components/home/ArtistCard';
import ArtistCardSkeleton from '../components/home/ArtistCardSkeleton';
import useFilterState from '../hooks/useFilterState';
import { API_BASE } from '../context/AuthContext';
import type { ServiceCategory } from '../data/types';
import useScrollReveal from '../hooks/useScrollReveal';
import './DiscoverPage.css';

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
      <div className="reveal-up">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          locationValue={locationQuery}
          onLocationChange={setLocationQuery}
          onFilter={handleFilter}
          placeholder="Search by name, style, occasion..."
        />
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
        <div className="discover-page__artists-grid stagger">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="reveal-scale" key={`skeleton-${index}`}>
              <ArtistCardSkeleton />
            </div>
          ))}
        </div>
      ) : artists.length > 0 ? (
        <div className="discover-page__artists-grid stagger">
          {artists.map((artist) => (
            <div className="reveal-scale" key={artist.id}>
              <ArtistCard
                artist={artist}
                onClick={handleArtistClick}
              />
            </div>
          ))}
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