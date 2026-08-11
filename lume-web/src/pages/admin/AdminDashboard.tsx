import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Users, Calendar, BarChart2, BadgeCheck, Clock, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { API_BASE } from '../../context/AuthContext';
import './AdminDashboard.css';

interface ArtistProfile {
  id: string;
  location: string;
  bio?: string;
  verificationStatus: string;
  verificationSubmittedAt?: string;
  specialties: string[];
  portfolioUrls: string[];
  certificationFiles: string[];
  profileImageUrl?: string;
  rating: number;
  reviewCount: number;
  user: { id: string; name: string; email: string; avatarUrl?: string; createdAt: string; };
}

interface Stats {
  totalUsers: number;
  totalArtists: number;
  pendingVerifications: number;
  totalBookings: number;
  verifiedArtists: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute } = useApi();

  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingArtists, setPendingArtists] = useState<ArtistProfile[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [actionMsg, setActionMsg] = useState('');
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    const [statsRes, pendingRes] = await Promise.all([
      execute('/api/admin/stats') as Promise<Stats | null>,
      execute('/api/admin/artists/pending') as Promise<ArtistProfile[] | null>,
    ]);
    if (statsRes) setStats(statsRes);
    if (pendingRes) setPendingArtists(pendingRes);
  };

  const handleVerify = async (artistId: string) => {
    setActioning(true); setActionMsg('');
    const res = await execute(`/api/admin/artists/${artistId}/verify`, { method: 'PATCH' });
    if (res) {
      setActionMsg('✅ Artist verified successfully!');
      setPendingArtists(prev => prev.filter(a => a.id !== artistId));
      setSelectedArtist(null);
      setStats(prev => prev ? { ...prev, pendingVerifications: prev.pendingVerifications - 1, verifiedArtists: prev.verifiedArtists + 1 } : prev);
    }
    setActioning(false);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleReject = async (artistId: string) => {
    setActioning(true); setActionMsg('');
    const res = await execute(`/api/admin/artists/${artistId}/reject`, { method: 'PATCH' });
    if (res) {
      setActionMsg('Artist rejected.');
      setPendingArtists(prev => prev.filter(a => a.id !== artistId));
      setSelectedArtist(null);
      setStats(prev => prev ? { ...prev, pendingVerifications: prev.pendingVerifications - 1 } : prev);
    }
    setActioning(false);
    setTimeout(() => setActionMsg(''), 4000);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">🌟 LUME Admin</h1>
          <p className="admin-header__sub">Platform Management Dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--mid)' }}>Signed in as <strong>{user?.email}</strong></span>
          <button type="button" onClick={() => navigate('/')} className="admin-back-btn">← Back to Site</button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="admin-stats">
          {[
            { label: 'Total Clients', value: stats.totalUsers, icon: <Users size={20} />, color: '#6366f1' },
            { label: 'Total Artists', value: stats.totalArtists, icon: <BarChart2 size={20} />, color: '#f59e0b' },
            { label: 'Verified Artists', value: stats.verifiedArtists, icon: <BadgeCheck size={20} />, color: '#10b981' },
            { label: 'Pending Reviews', value: stats.pendingVerifications, icon: <Clock size={20} />, color: '#ef4444' },
            { label: 'Total Bookings', value: stats.totalBookings, icon: <Calendar size={20} />, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="admin-stat-card" style={{ '--accent': s.color } as any}>
              <div className="admin-stat-card__icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
              <div className="admin-stat-card__value">{s.value}</div>
              <div className="admin-stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {actionMsg && (
        <div className="admin-alert" style={{ background: actionMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: actionMsg.startsWith('✅') ? '#065f46' : '#991b1b' }}>
          {actionMsg}
        </div>
      )}

      {/* Pending Verifications */}
      <div className="admin-section">
        <h2 className="admin-section__title">⏳ Pending Verifications ({pendingArtists.length})</h2>

        {pendingArtists.length === 0 ? (
          <div className="admin-empty">
            <CheckCircle size={40} color="#10b981" />
            <p>No pending verifications. You're all caught up! 🎉</p>
          </div>
        ) : (
          <div className="admin-artists-grid">
            {pendingArtists.map(artist => (
              <div key={artist.id} className="admin-artist-card" onClick={() => setSelectedArtist(artist)}>
                <div className="admin-artist-card__avatar">
                  {artist.profileImageUrl
                    ? <img src={`${API_BASE}${artist.profileImageUrl}`} alt={artist.user.name} />
                    : <span>{artist.user.name[0]}</span>
                  }
                </div>
                <div className="admin-artist-card__info">
                  <div className="admin-artist-card__name">{artist.user.name}</div>
                  <div className="admin-artist-card__email">{artist.user.email}</div>
                  <div className="admin-artist-card__location">📍 {artist.location}</div>
                  <div className="admin-artist-card__meta">
                    {artist.portfolioUrls.length} photos · {artist.certificationFiles.length} certs
                    {artist.verificationSubmittedAt && ` · Submitted ${new Date(artist.verificationSubmittedAt).toLocaleDateString('en-IN')}`}
                  </div>
                </div>
                <div className="admin-artist-card__badge">Review</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artist Detail Modal */}
      {selectedArtist && (
        <div className="admin-modal-overlay" onClick={() => setSelectedArtist(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="admin-modal__close" onClick={() => setSelectedArtist(null)}><X size={20} /></button>

            <div className="admin-modal__header">
              <div className="admin-modal__avatar">
                {selectedArtist.profileImageUrl
                  ? <img src={`${API_BASE}${selectedArtist.profileImageUrl}`} alt={selectedArtist.user.name} />
                  : <span>{selectedArtist.user.name[0]}</span>
                }
              </div>
              <div>
                <h3 className="admin-modal__name">{selectedArtist.user.name}</h3>
                <p className="admin-modal__email">{selectedArtist.user.email}</p>
                <p className="admin-modal__location">📍 {selectedArtist.location}</p>
              </div>
            </div>

            {selectedArtist.bio && (
              <div className="admin-modal__section">
                <div className="admin-modal__label">Bio</div>
                <p className="admin-modal__text">{selectedArtist.bio}</p>
              </div>
            )}

            {selectedArtist.specialties.length > 0 && (
              <div className="admin-modal__section">
                <div className="admin-modal__label">Specialties</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedArtist.specialties.map(s => (
                    <span key={s} className="admin-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedArtist.portfolioUrls.length > 0 && (
              <div className="admin-modal__section">
                <div className="admin-modal__label">Portfolio ({selectedArtist.portfolioUrls.length} photos)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px,1fr))', gap: 6 }}>
                  {selectedArtist.portfolioUrls.slice(0, 9).map((url, i) => (
                    <img key={i} src={url.startsWith('/') ? `${API_BASE}${url}` : url} alt={`Portfolio ${i+1}`}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(42,26,31,0.1)' }} />
                  ))}
                </div>
              </div>
            )}

            {selectedArtist.certificationFiles.length > 0 && (
              <div className="admin-modal__section">
                <div className="admin-modal__label">Certifications ({selectedArtist.certificationFiles.length} docs)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedArtist.certificationFiles.map((url, i) => (
                    <a key={i} href={url.startsWith('/') ? `${API_BASE}${url}` : url} target="_blank" rel="noopener noreferrer"
                      className="admin-cert-link">📄 Document {i + 1}</a>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-modal__actions">
              <button type="button" className="admin-btn admin-btn--reject" onClick={() => handleReject(selectedArtist.id)} disabled={actioning}>
                <ShieldAlert size={16} /> Reject
              </button>
              <button type="button" className="admin-btn admin-btn--verify" onClick={() => handleVerify(selectedArtist.id)} disabled={actioning}>
                <ShieldCheck size={16} /> {actioning ? 'Processing...' : '✅ Verify Artist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
