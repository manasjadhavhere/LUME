import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  ChevronRight,
  ChevronDown,
  BadgeCheck,
  Star,
  MapPin,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import useFavorites from '../hooks/useFavorites';
import { API_BASE } from '../context/AuthContext';
import { getArtistSlug } from '../utils/slug';
import './HomeEditorial.css';
import './SavedPage.css';

import img1 from '../assets/images/1.png';
import img2 from '../assets/images/2.png';
import img3 from '../assets/images/3.png';
import img4 from '../assets/images/4.png';
import img5 from '../assets/images/5.png';
import img6 from '../assets/images/6.png';
import img7 from '../assets/images/7.png';

const ASSET_IMAGES = [img1, img2, img3, img4, img5, img6, img7];

const handleImageFallback = (e: React.SyntheticEvent<HTMLImageElement, Event>, index = 0) => {
  const target = e.currentTarget;
  const fallback = ASSET_IMAGES[index % ASSET_IMAGES.length];
  if (target.src !== fallback) {
    target.src = fallback;
  }
};

const mediaUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
};

const SavedPage: React.FC = () => {
  const { getFavorites, toggleFavorite, isFavorite } = useFavorites();
  const [savedArtists, setSavedArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeroInfoOpen, setIsHeroInfoOpen] = useState(false);

  useEffect(() => {
    const favoriteIds = getFavorites();
    if (favoriteIds.length === 0) {
      setSavedArtists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Fetch all artists and filter by saved IDs
    fetch(`${API_BASE}/api/artists?limit=100`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const all: any[] = data.data.artists || [];
          setSavedArtists(all.filter((a) => favoriteIds.includes(a.id)));
        }
      })
      .catch(() => setSavedArtists([]))
      .finally(() => setIsLoading(false));
  }, [getFavorites]);

  const handleRemoveFavorite = (artistId: string) => {
    toggleFavorite(artistId);
    setSavedArtists((prev) => prev.filter((a) => a.id !== artistId));
  };

  return (
    <div className="saved-page">
      {/* ── Editorial Hero ── */}
      <section className={`saved-hero ${isHeroInfoOpen ? 'is-info-open' : ''}`}>
        <div className="saved-hero__inner">
          <div className="saved-hero__top-bar">
            <nav className="saved-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={14} />
              <span>Saved Artists</span>
            </nav>

            <button
              type="button"
              className={`saved-hero__mobile-toggle ${isHeroInfoOpen ? 'is-active' : ''}`}
              onClick={() => setIsHeroInfoOpen(!isHeroInfoOpen)}
              aria-expanded={isHeroInfoOpen}
              aria-label={isHeroInfoOpen ? 'Hide shortlist details' : 'Show shortlist details'}
            >
              <Sparkles size={12} />
              <span>{isHeroInfoOpen ? 'Hide info' : 'About shortlist'}</span>
              <ChevronDown size={14} className="saved-hero__toggle-chevron" />
            </button>
          </div>

          <div className="saved-hero__header-row">
            <h1 className="saved-hero__title">
              Saved Artists. <em className="saved-hero__title-em">Portfolios close to your heart.</em>
            </h1>

            <div className="saved-hero__meta">
              <span className="saved-count-chip">
                <Heart size={13} fill="currentColor" />
                <span>
                  {savedArtists.length} {savedArtists.length === 1 ? 'shortlisted' : 'shortlisted'}
                </span>
              </span>
            </div>
          </div>

          <div className={`saved-hero__dropdown ${isHeroInfoOpen ? 'is-open' : ''}`}>
            <span className="saved-hero__eyebrow">
              <Sparkles size={15} /> YOUR CURATED SHORTLIST
            </span>

            <p className="saved-hero__desc">
              Review and compare your bookmarked makeup artists. Reach out directly or secure your date whenever you're ready.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content Section ── */}
      <div className="saved-content">
        <div className="saved-content__inner">
          {isLoading ? (
            <div className="saved-artists-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="home-artist-skeleton" key={`skeleton-${index}`} />
              ))}
            </div>
          ) : savedArtists.length > 0 ? (
            <div className="saved-artists-grid stagger">
              {savedArtists.map((artist, index) => {
                const photo = artist.profileImageUrl || artist.user?.avatarUrl;
                const imgUrl = photo ? mediaUrl(photo) : ASSET_IMAGES[index % ASSET_IMAGES.length];
                const artistName = artist.user?.name || 'Artist';
                const artistSlug = artist.slug || getArtistSlug(artistName, artist.id);
                const specialties: string[] = artist.specialties?.length ? artist.specialties : ['Artistry'];
                const startingPrice = Number(artist.startingPrice) || 0;

                return (
                  <article className="home-artist" key={artist.id}>
                    <div className="home-artist__media">
                      <Link
                        to={`/artist/${artistSlug}`}
                        className="home-artist__image"
                        aria-label={`View ${artistName}'s profile`}
                      >
                        <img
                          src={imgUrl}
                          alt={artistName}
                          loading="lazy"
                          onError={(e) => handleImageFallback(e, index)}
                        />
                        {artist.isVerified && (
                          <span className="home-artist__verified">
                            <BadgeCheck size={14} /> Verified
                          </span>
                        )}
                      </Link>
                      <button
                        className={`home-artist__save ${isFavorite(artist.id) ? 'is-saved' : ''}`}
                        type="button"
                        aria-label={`Remove ${artistName} from saved`}
                        aria-pressed={isFavorite(artist.id)}
                        onClick={() => handleRemoveFavorite(artist.id)}
                      >
                        <Heart size={18} fill="currentColor" />
                      </button>
                    </div>

                    <div className="home-artist__body">
                      <div className="home-artist__title">
                        <h3>
                          <Link to={`/artist/${artistSlug}`}>{artistName}</Link>
                        </h3>
                        {artist.rating > 0 ? (
                          <span className="home-artist__rating">
                            <Star size={11} fill="currentColor" /> {artist.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="home-artist__rating home-artist__rating--new">
                            <Sparkles size={11} strokeWidth={2} /> Pro
                          </span>
                        )}
                      </div>

                      <div className="home-artist__specialties">
                        {specialties.slice(0, 2).map((spec: string) => (
                          <span key={spec} className="home-artist__tag">{spec}</span>
                        ))}
                        {specialties.length > 2 && (
                          <span className="home-artist__tag home-artist__tag--more">+{specialties.length - 2}</span>
                        )}
                      </div>

                      <div className="home-artist__location">
                        <span className="home-artist__location-icon" aria-hidden="true">
                          <MapPin size={11} strokeWidth={2.4} />
                        </span>
                        <span className="home-artist__location-text">{artist.location || 'Pan India'}</span>
                      </div>

                      <div className="home-artist__bottom">
                        <div className="home-artist__price">
                          <span className="home-artist__price-label">From</span>
                          <strong className="home-artist__price-val">₹{startingPrice.toLocaleString('en-IN')}</strong>
                        </div>
                        <Link
                          to={`/artist/${artistSlug}`}
                          className="home-artist__action"
                          aria-label={`Explore ${artistName}`}
                        >
                          <ArrowUpRight size={18} strokeWidth={2.4} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="saved-page__empty-state">
              <div className="saved-empty-icon-wrap">
                <Heart size={32} />
              </div>
              <h2 className="saved-page__empty-title">No Saved Artists Yet</h2>
              <p className="saved-page__empty-message">
                Whenever you find an artist whose work inspires you, tap the heart icon to save them here for easy comparison and booking.
              </p>
              <Link to="/discover" className="saved-page__discover-btn">
                <RotateCcw size={16} /> Explore Artists
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedPage;
