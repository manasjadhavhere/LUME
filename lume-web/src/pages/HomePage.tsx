import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollPosition from '../hooks/useScrollPosition';
import useFilterState from '../hooks/useFilterState';
import HeroBanner from '../components/home/HeroBanner';
import CategoryChips from '../components/home/CategoryChips';
import ArtistCard from '../components/home/ArtistCard';
import ArtistCardSkeleton from '../components/home/ArtistCardSkeleton';
import SectionHeader from '../components/ui/SectionHeader';
import { filterArtistsByCategory } from '../data/demoData';
import type { ServiceCategory } from '../data/types';
import './HomePage.css';

const HOME_PAGE_CATEGORIES: Array<{ id: ServiceCategory; icon: string; image?: string; label: string }> = [
  { id: 'All', icon: '✨', label: 'All' },
  { id: 'Bridal', icon: '👰', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Bridal' },
  { id: 'Editorial', icon: '📸', image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Editorial' },
  { id: 'Evening', icon: '🌆', image: 'https://images.unsplash.com/photo-1566977755106-4b9ee5625c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Evening' },
  { id: 'Natural', icon: '🌿', image: 'https://images.unsplash.com/photo-1512413914583-11bf279a016f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Natural' },
  { id: 'Glam', icon: '💫', image: 'https://images.unsplash.com/photo-1516975080661-460d3d256877?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', label: 'Glam' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data loading with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Add scroll position persistence
  useScrollPosition(true);
  
  // Use persistent filter state
  const { activeCategory, setActiveCategory, searchQuery } = useFilterState();

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

  const handleHeroCTA = () => {
    // Scroll to top or navigate to discover
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <HeroBanner
        promo="Limited Slots Today"
        title="Discover Your Perfect Artist"
        ctaText="Explore Artists"
        onCtaClick={handleHeroCTA}
      />

      {/* Category Chips */}
      <SectionHeader title="Service Categories" />
      <CategoryChips
        categories={HOME_PAGE_CATEGORIES}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />

      {/* Artists List */}
      <div className="home-page__artists-section">
        <SectionHeader 
          title="Featured Artists" 
          seeAllText="See all"
          onSeeAll={() => navigate('/discover')}
        />
        
        {isLoading ? (
          <div className="home-page__artists-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <ArtistCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : filteredArtists.length > 0 ? (
          <div className="home-page__artists-list">
            {filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={handleArtistClick}
              />
            ))}
          </div>
        ) : (
          <div className="home-page__empty-state">
            <p className="home-page__empty-message">
              No artists match your search. Try different keywords or browse all categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
