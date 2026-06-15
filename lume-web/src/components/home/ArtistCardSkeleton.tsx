import React from 'react';
import './ArtistCardSkeleton.css';

const ArtistCardSkeleton: React.FC = () => {
  return (
    <div className="artist-card-skeleton">
      <div className="artist-card-skeleton__header">
        <div className="artist-card-skeleton__avatar skeleton" />
        
        <div className="artist-card-skeleton__info">
          <div className="artist-card-skeleton__name skeleton" />
          <div className="artist-card-skeleton__specialties skeleton" />
        </div>
      </div>
      
      <div className="artist-card-skeleton__stats">
        <div className="artist-card-skeleton__rating skeleton" />
        <div className="artist-card-skeleton__location skeleton" />
      </div>
      
      <div className="artist-card-skeleton__footer">
        <div className="artist-card-skeleton__price skeleton" />
      </div>
    </div>
  );
};

export default ArtistCardSkeleton;
