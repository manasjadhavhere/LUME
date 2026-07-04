import React from 'react';
import { Star, MapPin } from 'lucide-react';
import Badge, { type BadgeVariant } from '../ui/Badge';
import type { Artist } from '../../data/types';
import './ArtistCard.css';

interface ArtistCardProps {
  artist: Artist;
  onClick: (id: string) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  const handleClick = () => {
    onClick(artist.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const getBadgeVariant = (badge: string): BadgeVariant => {
    switch (badge) {
      case 'Top Pick':
        return 'top-pick';
      case 'New':
        return 'new';
      default:
        return 'certified';
    }
  };

  // Use artist.avatar from demoData (Unsplash URLs per artist)
  const [imgError, setImgError] = React.useState(false);
  const fallbackImg = `https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`;
  const imgUrl = !imgError && artist.avatar ? artist.avatar : fallbackImg;

  return (
    <div
      className="artist-card stagger-item hover-scale-down"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${artist.name}'s profile`}
    >
      <div className="artist-card__image-wrapper">
        <img src={imgUrl} alt={artist.name} className="artist-card__image" onError={() => setImgError(true)} />
        {artist.badge && (
          <div className="artist-card__badge">
            <Badge variant={getBadgeVariant(artist.badge)} text={artist.badge} />
          </div>
        )}
      </div>
      
      <div className="artist-card__content">
        <div className="artist-card__header">
          <h3 className="artist-card__name">{artist.name}</h3>
          <p className="artist-card__specialties">
            {artist.specialties.join(' · ')}
          </p>
        </div>
        
        <div className="artist-card__stats">
          <div className="artist-card__rating">
            <Star className="artist-card__star" size={14} />
            <span className="artist-card__rating-value">{artist.rating}</span>
            <span className="artist-card__reviews">({artist.reviewCount})</span>
          </div>
          
          <div className="artist-card__location">
            <MapPin className="artist-card__location-icon" size={14} />
            <span className="artist-card__distance">{artist.distance} km</span>
          </div>
        </div>
        
        <div className="artist-card__footer">
          <div className="artist-card__price">
            <span className="artist-card__price-value">₹{artist.startingPrice.toLocaleString()}</span>
            <span className="artist-card__price-label">onwards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;