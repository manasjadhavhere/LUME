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
  badge?: string;
  experience?: number;
  certification?: string;
  startingPrice?: number;
  weddingPrice?: number;
  occasionPrice?: number;
  hourlyPrice?: number;
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [remarks, setRemarks] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actioning, setActioning] = useState(false);

  // We fetch all artists to allow editing any profile
  const [allArtists, setAllArtists] = useState<ArtistProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    const [statsRes, pendingRes, allRes] = await Promise.all([
      execute('/api/admin/stats') as Promise<Stats | null>,
      execute('/api/admin/artists/pending') as Promise<ArtistProfile[] | null>,
      execute('/api/admin/artists') as Promise<ArtistProfile[] | null>,
    ]);
    if (statsRes) setStats(statsRes);
    if (pendingRes) setPendingArtists(pendingRes);
    if (allRes) setAllArtists(allRes);
  };

  const handleVerify = async (artistId: string) => {
    setActioning(true); setActionMsg('');
    const res = await execute(`/api/admin/artists/${artistId}/verify`, { 
      method: 'PATCH',
      body: { remarks }
    });
    if (res) {
      setActionMsg('✅ Artist verified successfully!');
      setPendingArtists(prev => prev.filter(a => a.id !== artistId));
      setSelectedArtist(null);
      setRemarks('');
      setStats(prev => prev ? { ...prev, pendingVerifications: prev.pendingVerifications - 1, verifiedArtists: prev.verifiedArtists + 1 } : prev);
      loadData();
    }
    setActioning(false);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleReject = async (artistId: string) => {
    setActioning(true); setActionMsg('');
    const res = await execute(`/api/admin/artists/${artistId}/reject`, { 
      method: 'PATCH',
      body: { remarks }
    });
    if (res) {
      setActionMsg('Artist rejected.');
      setPendingArtists(prev => prev.filter(a => a.id !== artistId));
      setSelectedArtist(null);
      setRemarks('');
      setStats(prev => prev ? { ...prev, pendingVerifications: prev.pendingVerifications - 1 } : prev);
      loadData();
    }
    setActioning(false);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleSaveEdit = async () => {
    if (!selectedArtist) return;
    setActioning(true); setActionMsg('');
    
    const res = await execute(`/api/admin/artists/${selectedArtist.id}`, {
      method: 'PUT',
      body: { ...editFormData, remarks }
    });
    
    if (res) {
      setActionMsg('✅ Artist profile updated!');
      setIsEditMode(false);
      setRemarks('');
      setSelectedArtist(null);
      loadData();
    }
    setActioning(false);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const openArtistModal = (artist: ArtistProfile) => {
    setSelectedArtist(artist);
    setRemarks('');
    setIsEditMode(false);
    setEditFormData({
      name: artist.user.name,
      location: artist.location || '',
      bio: artist.bio || '',
      experience: artist.experience || 0,
      certification: artist.certification || '',
      badge: artist.badge || '',
      verificationStatus: artist.verificationStatus || 'PENDING',
      startingPrice: artist.startingPrice || 0,
      weddingPrice: artist.weddingPrice || 0,
      occasionPrice: artist.occasionPrice || 0,
      hourlyPrice: artist.hourlyPrice || 0,
    });
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

      {/* List Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: '0 24px' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ padding: '8px 16px', borderRadius: 8, background: activeTab === 'pending' ? 'var(--dark)' : 'white', color: activeTab === 'pending' ? 'white' : 'var(--dark)', border: '1px solid var(--border)' }}
        >
          Pending Verifications ({pendingArtists.length})
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ padding: '8px 16px', borderRadius: 8, background: activeTab === 'all' ? 'var(--dark)' : 'white', color: activeTab === 'all' ? 'white' : 'var(--dark)', border: '1px solid var(--border)' }}
        >
          All Artists ({allArtists.length})
        </button>
      </div>

      <div className="admin-section">
        {activeTab === 'pending' ? (
          <>
            {pendingArtists.length === 0 ? (
              <div className="admin-empty">
                <CheckCircle size={40} color="#10b981" />
                <p>No pending verifications. You're all caught up! 🎉</p>
              </div>
            ) : (
              <div className="admin-artists-grid">
                {pendingArtists.map(artist => (
                  <div key={artist.id} className="admin-artist-card" onClick={() => openArtistModal(artist)}>
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
          </>
        ) : (
          <div className="admin-artists-grid">
            {allArtists.map(artist => (
              <div key={artist.id} className="admin-artist-card" onClick={() => openArtistModal(artist)}>
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
                    Status: {artist.verificationStatus}
                  </div>
                </div>
                <div className="admin-artist-card__badge">Edit Profile</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artist Detail & Edit Modal */}
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
              <div style={{ flex: 1 }}>
                {isEditMode ? (
                  <input className="admin-modal__input" style={{ fontSize: '1.2rem', fontWeight: 'bold' }} value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                ) : (
                  <h3 className="admin-modal__name">{selectedArtist.user.name}</h3>
                )}
                <p className="admin-modal__email">{selectedArtist.user.email}</p>
                {isEditMode ? (
                  <input className="admin-modal__input" placeholder="Location" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} />
                ) : (
                  <p className="admin-modal__location">📍 {selectedArtist.location}</p>
                )}
              </div>
              <button className="admin-btn" style={{ padding: '6px 12px', background: 'var(--mid)', color: 'white' }} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            {isEditMode ? (
              <div style={{ display: 'grid', gap: 12, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="admin-modal__section">
                  <label className="admin-modal__label">Verification Status</label>
                  <select className="admin-modal__input" value={editFormData.verificationStatus} onChange={e => setEditFormData({...editFormData, verificationStatus: e.target.value})}>
                    <option value="NOT_SUBMITTED">Not Submitted</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="admin-modal__section">
                  <label className="admin-modal__label">Badge</label>
                  <select className="admin-modal__input" value={editFormData.badge} onChange={e => setEditFormData({...editFormData, badge: e.target.value})}>
                    <option value="">None</option>
                    <option value="TOP_PICK">Top Pick</option>
                    <option value="FEATURED">Featured</option>
                    <option value="NEW">New</option>
                    <option value="VERIFIED">Verified</option>
                  </select>
                </div>
                <div className="admin-modal__section">
                  <label className="admin-modal__label">Bio</label>
                  <textarea className="admin-modal__input" rows={3} value={editFormData.bio} onChange={e => setEditFormData({...editFormData, bio: e.target.value})} />
                </div>
                <div className="admin-modal__section">
                  <label className="admin-modal__label">Experience (Years)</label>
                  <input type="number" className="admin-modal__input" value={editFormData.experience} onChange={e => setEditFormData({...editFormData, experience: Number(e.target.value)})} />
                </div>
                <div className="admin-modal__section">
                  <label className="admin-modal__label">Starting Price</label>
                  <input type="number" className="admin-modal__input" value={editFormData.startingPrice} onChange={e => setEditFormData({...editFormData, startingPrice: Number(e.target.value)})} />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}

            {/* Remarks Input */}
            <div className="admin-modal__section" style={{ marginTop: 16 }}>
              <label className="admin-modal__label">Admin Remarks (Sent to Artist as Notification)</label>
              <textarea 
                className="admin-modal__input" 
                rows={3} 
                placeholder="Optional: Add feedback, reasons for rejection, or notes for the artist..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            <div className="admin-modal__actions">
              {isEditMode ? (
                <button type="button" className="admin-btn admin-btn--verify" onClick={handleSaveEdit} disabled={actioning} style={{ width: '100%' }}>
                  <ShieldCheck size={16} /> {actioning ? 'Saving...' : 'Save Profile Changes'}
                </button>
              ) : (
                <>
                  <button type="button" className="admin-btn admin-btn--reject" onClick={() => handleReject(selectedArtist.id)} disabled={actioning}>
                    <ShieldAlert size={16} /> Reject
                  </button>
                  <button type="button" className="admin-btn admin-btn--verify" onClick={() => handleVerify(selectedArtist.id)} disabled={actioning}>
                    <ShieldCheck size={16} /> {actioning ? 'Processing...' : '✅ Verify Artist'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
