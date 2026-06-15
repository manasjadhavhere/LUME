import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import useFavorites from '../hooks/useFavorites';
import ArtistCard from '../components/home/ArtistCard';
import { demoArtists } from '../data/demoData';
import './SavedPage.css';

const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const { getFavorites } = useFavorites();

  // Get favorited artists from demo data
  const favoriteArtists = useMemo(() => {
    const favoriteIds = getFavorites();
    return demoArtists.filter(artist => favoriteIds.includes(artist.id));
  }, [getFavorites]);

  const handleArtistClick = (id: string) => {
    navigate(`/artist/${id}`);
  };

  return (
    <div className="saved-page">
      <div className="saved-page__header">
        <h1 className="saved-page__title">Saved Artists</h1>
        <div className="saved-page__count">
          {favoriteArtists.length} {favoriteArtists.length === 1 ? 'artist' : 'artists'}
        </div>
      </div>

      {favoriteArtists.length > 0 ? (
        <div className="saved-page__list">
          {favoriteArtists.map((artist, index) => (
            <div key={artist.id} className="saved-page__item" style={{ animationDelay: `${index * 100}ms` }}>
              <ArtistCard artist={artist} onClick={handleArtistClick} />
            </div>
          ))}
        </div>
      ) : (
        <div className="saved-page__empty">
          <div className="saved-page__empty-icon">
            <Heart size={64} />
          </div>
          <h2 className="saved-page__empty-title">No saved artists yet</h2>
          <p className="saved-page__empty-text">
            Tap the heart icon on artist profiles to save your favorites and find them here.
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedPage;
