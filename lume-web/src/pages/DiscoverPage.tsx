import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/home/SearchBar';
import CategoryChips from '../components/home/CategoryChips';
import ArtistCard from '../components/home/ArtistCard';
import ArtistCardSkeleton from '../components/home/ArtistCardSkeleton';
import useFilterState from '../hooks/useFilterState';
import { filterArtistsByCategory } from '../data/demoData';
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
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Use persistent filter state (shared with HomePage)
  const { activeCategory, setActiveCategory, searchQuery, setSearchQuery, clearFilterState } = useFilterState();

  // Combined filtering logic: category first, then search
  const filteredArtists = useMemo(() => {
    // First apply category filter
    const categoryFiltered = filterArtistsByCategory(activeCategory);
    
    // Then apply search filter
    if (!searchQuery.trim()) {
      return categoryFiltered;
    }
    
    const lowerQuery = searchQuery.toLowerCase().trim();
    return categoryFiltered.filter(artist =>
      artist.name.toLowerCase().includes(lowerQuery) ||
      artist.specialties.some(s => s.toLowerCase().includes(lowerQuery)) ||
      artist.location.toLowerCase().includes(lowerQuery)
    );
  }, [activeCategory, searchQuery]);

  const handleArtistClick = (id: string) => {
    navigate(`/artist/${id}`);
  };

  const handleFilter = () => {
    // Placeholder for advanced filter functionality
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
          {isLoading ? 'Loading...' : `${filteredArtists.length} ${filteredArtists.length === 1 ? 'artist' : 'artists'} found`}
        </p>
      </div>

      {/* Artists Grid */}
      {isLoading ? (
        <div className="discover-page__artists-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <ArtistCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : filteredArtists.length > 0 ? (
        <div className="discover-page__artists-grid">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={handleArtistClick}
            />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default DiscoverPage;