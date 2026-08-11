import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import SearchBar from '../components/home/SearchBar';
import CategoryChips from '../components/home/CategoryChips';
import ArtistCard from '../components/home/ArtistCard';
import ArtistCardSkeleton from '../components/home/ArtistCardSkeleton';
import useFilterState from '../hooks/useFilterState';
import { API_BASE } from '../context/AuthContext';
import type { ServiceCategory } from '../data/types';
import './DiscoverPage.css';

const DISCOVER_CATEGORIES: Array<{ id: ServiceCategory; icon: string; label: string }> = [
  { id: 'All', icon: '✨', label: 'All' },
  { id: 'Bridal', icon: '👰', label: 'Bridal' },
  { id: 'Editorial', icon: '📸', label: 'Editorial' },
  { id: 'Evening', icon: '🌆', label: 'Evening' },
  { id: 'Natural', icon: '🌿', label: 'Natural' },
  { id: 'Glam', icon: '💫', label: 'Glam' },
];

const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { activeCategory, setActiveCategory, searchQuery, setSearchQuery, clearFilterState } = useFilterState();

  useEffect(() => {
    setIsLoading(true);
    setError('');
    const queryParams = new URLSearchParams();
    if (activeCategory !== 'All') queryParams.append('specialty', activeCategory);
    if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

    fetch(`${API_BASE}/api/artists?${queryParams.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setArtists(data.data.artists);
        else setError(data.message || 'Failed to load artists');
      })
      .catch(() => setError('Network error. Please try again later.'))
      .finally(() => setIsLoading(false));
  }, [activeCategory, searchQuery]);

  const handleArtistClick = (id: string) => {
    navigate(`/artist/${id}`);
  };

  const handleFilter = () => {
    console.log('Advanced filters - coming soon!');
  };

  return (
    <div className="discover-page">
      {/* Header */}
      <div className="discover-page__header">
        <h1 className="discover-page__title">Discover Artists</h1>
        <p className="discover-page__subtitle">
          Find the perfect makeup artist for any occasion
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onFilter={handleFilter}
        placeholder="Search by name, style, location..."
      />

      {/* Filter Categories */}
      <div className="discover-page__filters">
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
        <div className="discover-page__artists-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <ArtistCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : artists.length > 0 ? (
        <div className="discover-page__artists-grid">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={handleArtistClick}
            />
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
  );
};

export default DiscoverPage;