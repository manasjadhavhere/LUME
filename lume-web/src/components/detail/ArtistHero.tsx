import React from 'react';
import { ArrowLeft, Heart, CheckCircle2, MapPin, Award } from 'lucide-react';
import type { Artist } from '../../data/types';
import StatsBar from './StatsBar';
import './ArtistHero.css';

interface ArtistHeroProps {
  artist: Artist;
  isFavorite: boolean;
  onBack: () => void;
  onFavoriteToggle: () => void;
}

const ArtistHero: React.FC<ArtistHeroProps> = ({
  artist,
  isFavorite,
  onBack,
  onFavoriteToggle
}) => {
  return (
    <div className="artist-hero">
      {/* Gradient background */}
      <div className="artist-hero__background" />
      
      {/* Controls */}
      <div className="artist-hero__controls">
        <button
          className="artist-hero__button artist-hero__button--back"
          onClick={onBack}
          aria-label="Go back"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div style={{flex: 1}}></div>
        
        <button
          className={`artist-hero__button artist-hero__button--favorite ${
            isFavorite ? 'artist-hero__button--favorite-active' : ''
          }`}
          onClick={onFavoriteToggle}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="artist-hero__content-wrapper container-responsive">
        {/* Left Column: Artist Profile */}
        <div className="artist-hero__profile">
          <div className="artist-hero__avatar-wrapper">
            <div className="artist-hero__avatar">
              <img src={artist.avatar} alt={artist.name} className="artist-hero__image" />
            </div>
            <div className="artist-hero__verified-badge">
              <CheckCircle2 size={16} fill="white" color="var(--rose-deep)" />
            </div>
          </div>
          
          <div className="artist-hero__details">
            <h1 className="artist-hero__name">{artist.name}</h1>
            <p className="artist-hero__certification">{artist.certification}</p>
            <p className="artist-hero__location">
              <MapPin size={14} />
              {artist.location}
            </p>

            <div className="artist-hero__tags">
              <span className="artist-hero__tag">
                <CheckCircle2 size={12} />
                Verified Artist
              </span>
              <span className="artist-hero__tag">
                <Award size={12} />
                {artist.experience}+ Years Experience
              </span>
            </div>

            <p className="artist-hero__bio">
              Specializing in {artist.specialties.slice(0, 2).map(s => s.toLowerCase()).join(', ')} & luxury makeup.<br/>
              Let's bring out your most confident self.
            </p>
          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="artist-hero__stats-col">
          <StatsBar stats={{
            rating: artist.rating,
            reviewCount: artist.reviewCount,
            experience: artist.experience,
            bookingCount: artist.bookingCount
          }} />
        </div>
      </div>
    </div>
  );
};

export default ArtistHero;
