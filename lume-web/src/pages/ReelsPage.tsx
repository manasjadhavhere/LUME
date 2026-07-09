import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Upload,
  Heart,
  Share2,
  X,
  Plus,
  ExternalLink,
  Sparkles,
  Check,
  Music
} from 'lucide-react';
import { useToastContext } from '../context/ToastContext';
import './ReelsPage.css';

export interface ReelItem {
  id: string;
  title: string;
  desc: string;
  category: 'BRIDAL' | 'TUTORIAL' | 'EDITORIAL' | 'GLAM';
  artistName: string;
  artistRole: string;
  artistAvatar: string;
  embedUrl?: string;
  videoUrl?: string;
  likes: number;
  views: string;
  isLiked?: boolean;
}

const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    title: 'Royal Sabyasachi Bridal Glow',
    desc: 'Step-by-step luxury Indian bridal glam with HD airbrush finish and 24K gold foil accent.',
    category: 'BRIDAL',
    artistName: 'Sia Kapoor',
    artistRole: 'Celebrity & Bridal Artist',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    embedUrl: 'https://www.youtube.com/embed/S2p-4nN66l0',
    likes: 1420,
    views: '18.4K',
  },
  {
    id: 'reel-2',
    title: 'Glass Skin & Flawless Dewy Base Tutorial',
    desc: 'How to achieve the ultimate Korean-inspired glass skin using luminous hydrating serums and cream blush.',
    category: 'TUTORIAL',
    artistName: 'Elena Rostova',
    artistRole: 'Editorial & Fashion Specialist',
    artistAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    embedUrl: 'https://www.youtube.com/embed/JF8BRvqGCNs',
    likes: 980,
    views: '12.1K',
  },
  {
    id: 'reel-3',
    title: 'Avant-Garde Metallic Eye Runway Glam',
    desc: 'Backstage transformation for India Fashion Week featuring multidimensional chrome pigments.',
    category: 'EDITORIAL',
    artistName: 'Vikram Seth',
    artistRole: 'High-Fashion Makeup Master',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    likes: 765,
    views: '9.3K',
  },
  {
    id: 'reel-4',
    title: 'Sunkissed Haldi Ceremony Look',
    desc: 'Waterproof and sweat-resistant floral Haldi look designed for vibrant daytime celebrations.',
    category: 'BRIDAL',
    artistName: 'Ayesha Khan',
    artistRole: 'Traditional Bridal Expert',
    artistAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    embedUrl: 'https://www.youtube.com/embed/S2p-4nN66l0',
    likes: 1150,
    views: '14.8K',
  },
  {
    id: 'reel-5',
    title: 'Smokey Eye & Nude Lip Masterclass',
    desc: 'Pro tips for blending matte shadow seamlessly for an elevated cocktail or sangeet evening look.',
    category: 'GLAM',
    artistName: 'Rohan Das',
    artistRole: 'Celebrity Makeup Director',
    artistAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    embedUrl: 'https://www.youtube.com/embed/JF8BRvqGCNs',
    likes: 840,
    views: '10.5K',
  },
  {
    id: 'reel-6',
    title: 'Classic Muhurtham South Indian Bridal Look',
    desc: 'Timeless temple jewellery pairing with crisp winged liner and traditional jasmine gajra styling.',
    category: 'BRIDAL',
    artistName: 'Meera Nair',
    artistRole: 'Bridal & Heritage Master',
    artistAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    embedUrl: 'https://www.youtube.com/embed/S2p-4nN66l0',
    likes: 1690,
    views: '22.6K',
  },
];

/**
 * Helper to normalize YouTube / Instagram URLs into embeddable iframe URLs
 */
const formatEmbedUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  // YouTube watch URL: https://www.youtube.com/watch?v=XXXX
  const ytWatchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
  if (ytWatchMatch && ytWatchMatch[1]) {
    return `https://www.youtube.com/embed/${ytWatchMatch[1]}`;
  }
  return trimmed;
};

const ReelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  const [isMobileView, setIsMobileView] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [reels, setReels] = useState<ReelItem[]>(() => {
    try {
      const saved = localStorage.getItem('lume_custom_reels');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...INITIAL_REELS];
      }
    } catch (err) {
      console.error('Failed reading custom reels', err);
    }
    return INITIAL_REELS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activePlayReel, setActivePlayReel] = useState<ReelItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload modal form state
  const [sourceType, setSourceType] = useState<'embed' | 'file'>('embed');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<'BRIDAL' | 'TUTORIAL' | 'EDITORIAL' | 'GLAM'>('BRIDAL');
  const [artistName, setArtistName] = useState('Sia Kapoor');
  const [rawEmbedUrl, setRawEmbedUrl] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const categories = ['ALL', 'BRIDAL', 'TUTORIAL', 'EDITORIAL', 'GLAM'];

  const filteredReels = reels.filter(
    (r) => selectedCategory === 'ALL' || r.category === selectedCategory
  );

  const handleLikeToggle = (id: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const isLiked = !r.isLiked;
          return {
            ...r,
            isLiked,
            likes: isLiked ? r.likes + 1 : r.likes - 1,
          };
        }
        return r;
      })
    );
  };

  const handleShare = (reel: ReelItem) => {
    navigator.clipboard?.writeText(window.location.href);
    addToast(`Link copied for "${reel.title}"!`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setUploadedFileUrl(objectUrl);
      addToast(`Video "${file.name}" ready for upload!`, 'success');
    }
  };

  const handleSubmitNewReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Please enter a title for your reel.', 'error');
      return;
    }

    let finalEmbedUrl: string | undefined;
    let finalVideoUrl: string | undefined;

    if (sourceType === 'embed') {
      if (!rawEmbedUrl.trim()) {
        addToast('Please enter a YouTube or embed video URL.', 'error');
        return;
      }
      finalEmbedUrl = formatEmbedUrl(rawEmbedUrl);
    } else {
      if (!uploadedFileUrl) {
        addToast('Please upload a video file first.', 'error');
        return;
      }
      finalVideoUrl = uploadedFileUrl;
    }

    const newReel: ReelItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      desc: desc.trim() || 'Showcasing master artistry and signature beauty look.',
      category,
      artistName: artistName.trim() || 'Lume Artist',
      artistRole: 'Verified Beauty Artist',
      artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      embedUrl: finalEmbedUrl,
      videoUrl: finalVideoUrl,
      likes: 1,
      views: '1 New',
      isLiked: true,
    };

    const updatedReels = [newReel, ...reels];
    setReels(updatedReels);

    // Persist custom uploads
    try {
      const customOnly = updatedReels.filter((r) => r.id.startsWith('custom-'));
      localStorage.setItem('lume_custom_reels', JSON.stringify(customOnly));
    } catch (err) {
      console.error(err);
    }

    // Reset
    setTitle('');
    setDesc('');
    setRawEmbedUrl('');
    setUploadedFileUrl(null);
    setIsUploadModalOpen(false);
    addToast('Your reel was published successfully!', 'success');
  };

  const uploadModalNode = isUploadModalOpen && (
    <div
      className="upload-modal__backdrop"
      onClick={() => setIsUploadModalOpen(false)}
    >
      <div
        className="upload-modal__card"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="upload-modal__header">
          <h2 className="upload-modal__title">Add New Reel / Video</h2>
          <button
            className="reel-modal__close"
            style={{ position: 'static' }}
            onClick={() => setIsUploadModalOpen(false)}
          >
            <X size={18} />
          </button>
        </header>

        <form className="upload-modal__form" onSubmit={handleSubmitNewReel}>
          <div className="upload-modal__source-tabs">
            <button
              type="button"
              className={`upload-modal__source-tab ${
                sourceType === 'embed' ? 'upload-modal__source-tab--active' : ''
              }`}
              onClick={() => setSourceType('embed')}
            >
              <ExternalLink size={16} /> Embed YouTube / Insta URL
            </button>
            <button
              type="button"
              className={`upload-modal__source-tab ${
                sourceType === 'file' ? 'upload-modal__source-tab--active' : ''
              }`}
              onClick={() => setSourceType('file')}
            >
              <Upload size={16} /> Upload Video File
            </button>
          </div>

          {sourceType === 'embed' ? (
            <div className="upload-modal__field">
              <label htmlFor="embed-url">YouTube or Video Embed URL</label>
              <input
                id="embed-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                className="upload-modal__input"
                value={rawEmbedUrl}
                onChange={(e) => setRawEmbedUrl(e.target.value)}
              />
            </div>
          ) : (
            <div className="upload-modal__field">
              <label>Select Video File</label>
              <label className="upload-modal__dropzone">
                <input
                  type="file"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <Upload
                  size={28}
                  color="var(--rose-deep)"
                  style={{ marginBottom: 8 }}
                />
                <div style={{ fontWeight: 600, color: 'var(--dark)' }}>
                  {uploadedFileUrl
                    ? 'Video selected! Click to change'
                    : 'Click to upload video file'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 4 }}>
                  MP4, MOV, WebM supported
                </div>
              </label>
            </div>
          )}

          <div className="upload-modal__field">
            <label htmlFor="reel-title">Reel Title</label>
            <input
              id="reel-title"
              type="text"
              placeholder="e.g. Sabyasachi Inspired Bridal Transformation"
              className="upload-modal__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="upload-modal__field">
              <label htmlFor="reel-cat">Category</label>
              <select
                id="reel-cat"
                className="upload-modal__select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="BRIDAL">Bridal</option>
                <option value="TUTORIAL">Tutorial</option>
                <option value="EDITORIAL">Editorial</option>
                <option value="GLAM">Glam</option>
              </select>
            </div>

            <div className="upload-modal__field">
              <label htmlFor="artist-name">Artist Name</label>
              <input
                id="artist-name"
                type="text"
                className="upload-modal__input"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
            </div>
          </div>

          <div className="upload-modal__field">
            <label htmlFor="reel-desc">Description (Optional)</label>
            <textarea
              id="reel-desc"
              rows={2}
              placeholder="Tell clients about the look, technique, or occasion..."
              className="upload-modal__textarea"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="upload-modal__actions">
            <button
              type="button"
              className="lp-btn lp-btn--ghost-dark"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="lp-btn lp-btn--primary">
              Publish Reel <Check size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isMobileView) {
    return (
      <div className="reels-mobile-view">
        {/* Floating Header */}
        <div className="reels-mobile__header">
          <div className="reels-mobile__title-wrap">
            <Sparkles size={18} color="var(--rose-deep)" />
            <span>Reels</span>
          </div>
          <button className="reels-mobile__upload-btn" onClick={() => setIsUploadModalOpen(true)}>
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Floating Category Chips */}
        <div className="reels-mobile__categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`reels-mobile__category-chip ${
                selectedCategory === cat ? 'reels-mobile__category-chip--active' : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'For You' : cat}
            </button>
          ))}
        </div>

        {/* Snap Scroll Fullscreen Feed */}
        <div className="reels-mobile__feed">
          {filteredReels.map((reel) => (
            <div key={reel.id} className="reels-mobile__slide">
              {reel.videoUrl ? (
                <video
                  src={reel.videoUrl}
                  className="reels-mobile__media"
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <iframe
                  src={`${reel.embedUrl}?autoplay=1&mute=0&controls=0&loop=1`}
                  title={reel.title}
                  className="reels-mobile__media"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              <div className="reels-mobile__gradient" />

              {/* Right Interaction Sidebar */}
              <div className="reels-mobile__actions">
                <div className="reels-mobile__action-item">
                  <button
                    className={`reels-mobile__action-btn ${
                      reel.isLiked ? 'reels-mobile__action-btn--liked' : ''
                    }`}
                    onClick={() => handleLikeToggle(reel.id)}
                  >
                    <Heart size={22} fill={reel.isLiked ? 'white' : 'transparent'} />
                  </button>
                  <span className="reels-mobile__action-label">{reel.likes}</span>
                </div>

                <div className="reels-mobile__action-item">
                  <button className="reels-mobile__action-btn" onClick={() => handleShare(reel)}>
                    <Share2 size={20} />
                  </button>
                  <span className="reels-mobile__action-label">Share</span>
                </div>
              </div>

              {/* Bottom Left Artist Info & Caption */}
              <div className="reels-mobile__caption">
                <div className="reels-mobile__artist-row">
                  <img src={reel.artistAvatar} alt={reel.artistName} className="reels-mobile__avatar" />
                  <div className="reels-mobile__artist-info">
                    <span className="reels-mobile__artist-name">{reel.artistName}</span>
                    <span className="reels-mobile__artist-role">{reel.artistRole}</span>
                  </div>
                  <button className="reels-mobile__book-btn" onClick={() => navigate('/home')}>
                    Book
                  </button>
                </div>

                <h3 className="reels-mobile__title">{reel.title}</h3>
                <p className="reels-mobile__desc">{reel.desc}</p>

                <div className="reels-mobile__music">
                  <Music size={12} /> Original Audio · Lume Masterclass
                </div>
              </div>
            </div>
          ))}
        </div>

        {uploadModalNode}
      </div>
    );
  }

  return (
    <div className="reels-page">
      {/* Header */}
      <header className="reels-header">
        <div className="reels-header__info">
          <span className="reels-header__eyebrow">
            <Sparkles size={14} /> Lume Video Showcase
          </span>
          <h1 className="reels-header__title">
            Watch Beauty <em>In Motion</em>
          </h1>
          <p className="reels-header__subtitle">
            Explore bridal glam, runway artistry, and masterclass tutorials — or upload your own look.
          </p>
        </div>

        <button
          className="reels-header__cta-btn"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Plus size={18} /> Upload Reel / Video
        </button>
      </header>

      {/* Category Tabs */}
      <nav className="reels-filters" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`reels-filter__tab ${
              selectedCategory === cat ? 'reels-filter__tab--active' : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'ALL' ? 'All Reels' : cat}
          </button>
        ))}
      </nav>

      {/* Reels Grid */}
      <main className="reels-grid">
        {filteredReels.map((reel) => (
          <article key={reel.id} className="reel-card">
            <div
              className="reel-card__media"
              onClick={() => setActivePlayReel(reel)}
              role="button"
              tabIndex={0}
              aria-label={`Play ${reel.title}`}
            >
              <span className="reel-card__badge">{reel.category}</span>

              {reel.videoUrl ? (
                <video
                  src={reel.videoUrl}
                  className="reel-card__video"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <iframe
                  src={reel.embedUrl}
                  title={reel.title}
                  className="reel-card__iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              <div className="reel-card__play-overlay">
                <div className="reel-card__play-btn">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="reel-card__info">
              <div className="reel-card__top-row">
                <div className="reel-card__creator">
                  <img
                    src={reel.artistAvatar}
                    alt={reel.artistName}
                    className="reel-card__avatar"
                  />
                  <div className="reel-card__creator-text">
                    <span className="reel-card__artist-name">{reel.artistName}</span>
                    <span className="reel-card__artist-role">{reel.artistRole}</span>
                  </div>
                </div>

                <div className="reel-card__actions">
                  <button
                    className={`reel-card__action-btn ${
                      reel.isLiked ? 'reel-card__action-btn--liked' : ''
                    }`}
                    onClick={() => handleLikeToggle(reel.id)}
                    aria-label="Like reel"
                  >
                    <Heart
                      size={14}
                      fill={reel.isLiked ? 'white' : 'transparent'}
                    />
                    <span>{reel.likes}</span>
                  </button>

                  <button
                    className="reel-card__action-btn"
                    onClick={() => handleShare(reel)}
                    aria-label="Share reel"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="reel-card__title">{reel.title}</h3>
              <p className="reel-card__desc">{reel.desc}</p>
            </div>
          </article>
        ))}
      </main>

      {/* Fullscreen Video Player Modal */}
      {activePlayReel && (
        <div
          className="reel-modal__backdrop"
          onClick={() => setActivePlayReel(null)}
        >
          <div
            className="reel-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="reel-modal__close"
              onClick={() => setActivePlayReel(null)}
              aria-label="Close video player"
            >
              <X size={20} />
            </button>

            <div className="reel-modal__media-wrap">
              {activePlayReel.videoUrl ? (
                <video
                  src={activePlayReel.videoUrl}
                  className="reel-modal__video"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <iframe
                  src={`${activePlayReel.embedUrl}?autoplay=1`}
                  title={activePlayReel.title}
                  className="reel-modal__iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}

      {uploadModalNode}
    </div>
  );
};

export default ReelsPage;
