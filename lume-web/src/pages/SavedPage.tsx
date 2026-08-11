import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import useFavorites from '../hooks/useFavorites';
import ArtistCard from '../components/home/ArtistCard';
import { API_BASE } from '../context/AuthContext';
import './SavedPage.css';

const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const { getFavorites } = useFavorites();
  const [savedArtists, setSavedArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const favoriteIds = getFavorites();
    if (favoriteIds.length === 0) {
      setIsLoading(false);
      return;
    }

    // Fetch all artists and filter by saved IDs
    fetch(`${API_BASE}/api/artists?limit=100`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const all: any[] = data.data.artists || [];
          setSavedArtists(all.filter(a => favoriteIds.includes(a.id)));
        }
      })
      .catch(() => setSavedArtists([]))
      .finally(() => setIsLoading(false));
  }, [getFavorites]);

  const handleArtistClick = (id: string) => {
    navigate(`/artist/${id}`);
  };

  return (
    <div className="saved-page">
      <div className="saved-page__header">
        <h1 className="saved-page__title">Saved Artists</h1>
        {!isLoading && (
          <div className="saved-page__count">
            {savedArtists.length} {savedArtists.length === 1 ? 'artist' : 'artists'}
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', color: 'var(--mid)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : savedArtists.length > 0 ? (
        <div className="saved-page__list">
          {savedArtists.map((artist, index) => (
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
          <button
            className="home-btn home-btn--primary"
            style={{ marginTop: 24 }}
            onClick={() => navigate('/discover')}
          >
            Discover Artists
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedPage;
