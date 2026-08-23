import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Users, Calendar, BarChart2, BadgeCheck, Clock, X, Home, Briefcase, User as UserIcon, ExternalLink } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useApi, apiFetch } from '../../hooks/useApi';
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
  isTakingBookings?: boolean;
  user: { id: string; name: string; email: string; avatarUrl?: string; createdAt: string; };
}

interface ClientUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  clientProfile?: {
    location?: string;
    mobileNumber?: string;
  };
}

interface Stats {
  totalUsers: number;
  totalArtists: number;
  pendingVerifications: number;
  totalBookings: number;
  verifiedArtists: number;
  charts?: {
    userGrowth: { month: string; clients: number; artists: number }[];
    bookingTrends: { month: string; completed: number; cancelled: number; other: number }[];
    verificationDist: { name: string; value: number; color: string }[];
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { execute } = useApi();

  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingArtists, setPendingArtists] = useState<ArtistProfile[]>([]);
  const [allArtists, setAllArtists] = useState<ArtistProfile[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'artists' | 'clients'>('dashboard');
  
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [remarks, setRemarks] = useState('');
  
  const [actionMsg, setActionMsg] = useState('');
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    const [statsRes, pendingRes, allRes, clientsRes] = await Promise.all([
      execute('/api/admin/stats') as Promise<Stats | null>,
      execute('/api/admin/artists/pending') as Promise<ArtistProfile[] | null>,
      execute('/api/admin/artists') as Promise<ArtistProfile[] | null>,
      execute('/api/admin/clients') as Promise<ClientUser[] | null>,
    ]);
    if (statsRes) setStats(statsRes);
    if (pendingRes) setPendingArtists(pendingRes);
    if (allRes) setAllArtists(allRes);
    if (clientsRes) setClients(clientsRes);
  };

  const displayMsg = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleVerify = async (artistId: string) => {
    setActioning(true);
    const res = await execute(`/api/admin/artists/${artistId}/verify`, { method: 'PATCH', body: { remarks } });
    if (res) {
      displayMsg('✅ Artist verified successfully!');
      setSelectedArtist(null);
      loadData();
    }
    setActioning(false);
  };

  const handleReject = async (artistId: string) => {
    setActioning(true);
    const res = await execute(`/api/admin/artists/${artistId}/reject`, { method: 'PATCH', body: { remarks } });
    if (res) {
      displayMsg('Artist rejected.');
      setSelectedArtist(null);
      loadData();
    }
    setActioning(false);
  };

  const handleApproveEdit = async (artistId: string) => {
    setActioning(true);
    const res = await execute(`/api/admin/artists/${artistId}/approve-edit`, { method: 'PATCH' });
    if (res) {
      displayMsg('✅ Edit request approved!');
      setSelectedArtist(null);
      loadData();
    }
    setActioning(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedArtist) return;
    setActioning(true);
    const res = await execute(`/api/admin/artists/${selectedArtist.id}`, { method: 'PUT', body: { ...editFormData, remarks } });
    if (res) {
      displayMsg('✅ Artist profile updated!');
      setIsEditMode(false);
      setSelectedArtist(null);
      loadData();
    }
    setActioning(false);
  };

  const handleDeleteUser = async (userId: string, role: 'artist' | 'client') => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${role}? This will delete all their bookings and data.`)) return;
    setActioning(true);
    const res = await execute(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res) {
      displayMsg(`✅ ${role} deleted successfully!`);
      setSelectedArtist(null);
      loadData();
    }
    setActioning(false);
  };

  const toggleBookingStatusAdmin = async (artistId: string, currentStatus: boolean) => {
    if (actioning) return;
    setActioning(true);
    try {
      const res = await apiFetch(`/api/admin/artists/${artistId}/booking-status`, {
        method: 'PATCH',
        body: { isTakingBookings: !currentStatus },
        token: token || undefined
      });
      if (res) {
        displayMsg('✅ Booking status overridden successfully!');
        setAllArtists(prev => prev.map(a => a.id === artistId ? { ...a, isTakingBookings: !currentStatus } : a));
        if (selectedArtist && selectedArtist.id === artistId) {
          setSelectedArtist({ ...selectedArtist, isTakingBookings: !currentStatus });
        }
      }
    } catch (e: any) {
      displayMsg('❌ ' + (e.message || 'Failed to override status'));
    } finally {
      setActioning(false);
    }
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
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-sidebar-logo">
            <ShieldCheck size={24} color="#3b82f6" /> LUME Admin
          </Link>
        </div>
        <div className="admin-sidebar-menu">
          <button className={`admin-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Home size={18} /> Dashboard Overview
          </button>
          <button className={`admin-menu-item ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>
            <Briefcase size={18} /> Artist Directory
            {pendingArtists.length > 0 && <span className="admin-menu-badge">{pendingArtists.length}</span>}
          </button>
          <button className={`admin-menu-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
            <UserIcon size={18} /> Client Directory
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'artists' && 'Artist Directory'}
            {activeTab === 'clients' && 'Client Directory'}
          </div>
          <div className="admin-topbar-right">
            {actionMsg && (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: actionMsg.startsWith('✅') ? '#059669' : '#dc2626' }}>
                {actionMsg}
              </span>
            )}
            <div className="admin-user-info">Signed in as <strong>{user?.email}</strong></div>
            <button onClick={() => navigate('/')} className="admin-back-btn">
              <ExternalLink size={16} /> Back to Site
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {activeTab === 'dashboard' && stats && (
            <>
              <div className="admin-stats-grid">
                {[
                  { label: 'Total Clients', value: stats.totalUsers, icon: <Users size={20} />, color: '#6366f1' },
                  { label: 'Total Artists', value: stats.totalArtists, icon: <BarChart2 size={20} />, color: '#f59e0b' },
                  { label: 'Verified Artists', value: stats.verifiedArtists, icon: <BadgeCheck size={20} />, color: '#10b981' },
                  { label: 'Pending Reviews', value: stats.pendingVerifications, icon: <Clock size={20} />, color: '#ef4444' },
                  { label: 'Total Bookings', value: stats.totalBookings, icon: <Calendar size={20} />, color: '#8b5cf6' },
                ].map(s => (
                  <div key={s.label} className="admin-stat-card">
                    <div className="admin-stat-card-header">
                      <div className="admin-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
                    </div>
                    <div className="admin-stat-value">{s.value}</div>
                    <div className="admin-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {stats.charts && (
                <div className="admin-charts-grid">
                  <div className="admin-chart-card">
                    <h3 className="admin-chart-title">User Growth (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.charts.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                        <RechartsTooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: 20}} />
                        <Line type="monotone" dataKey="clients" name="New Clients" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="artists" name="New Artists" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="admin-chart-card">
                    <h3 className="admin-chart-title">Booking Trends (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.charts.bookingTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                        <RechartsTooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} cursor={{fill: '#f1f5f9'}} />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: 20}} />
                        <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0,0,4,4]} />
                        <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#ef4444" />
                        <Bar dataKey="other" name="Other/Pending" stackId="a" fill="#94a3b8" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="admin-chart-card">
                    <h3 className="admin-chart-title">Artist Verification Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.charts.verificationDist}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {stats.charts.verificationDist.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {pendingArtists.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 16, color: '#0f172a' }}>Pending Verifications</h3>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Artist</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingArtists.map(artist => (
                          <tr key={artist.id}>
                            <td>
                              <div className="admin-table-user">
                                <div className="admin-table-avatar">
                                  {artist.profileImageUrl ? <img src={`${API_BASE}${artist.profileImageUrl}`} alt={artist.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : artist.user.name[0]}
                                </div>
                                <div>
                                  <div className="admin-table-name">{artist.user.name}</div>
                                  <div className="admin-table-email">{artist.user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{artist.location || '-'}</td>
                            <td><span className="admin-badge pending">PENDING</span></td>
                            <td>{artist.verificationSubmittedAt ? new Date(artist.verificationSubmittedAt).toLocaleDateString() : '-'}</td>
                            <td>
                              <button className="admin-btn" onClick={() => openArtistModal(artist)}>Review</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'artists' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Artist</th>
                    <th>Status</th>
                    <th>Taking Bookings? (Admin Override)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allArtists.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="admin-empty-state">
                          <Users size={40} />
                          <h3>No artists found</h3>
                        </div>
                      </td>
                    </tr>
                  )}
                  {allArtists.map(artist => (
                    <tr key={artist.id}>
                      <td>
                        <div className="admin-table-user">
                          <div className="admin-table-avatar">
                            {artist.profileImageUrl ? <img src={`${API_BASE}${artist.profileImageUrl}`} alt={artist.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : artist.user.name[0]}
                          </div>
                          <div>
                            <div className="admin-table-name">{artist.user.name}</div>
                            <div className="admin-table-email">{artist.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${artist.verificationStatus.toLowerCase()}`}>
                          {artist.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button 
                            className="admin-toggle-switch" 
                            style={{ background: artist.isTakingBookings ? '#10b981' : '#cbd5e1' }}
                            onClick={() => toggleBookingStatusAdmin(artist.id, !!artist.isTakingBookings)}
                            disabled={actioning}
                          >
                            <div className="dot" style={{ left: artist.isTakingBookings ? '22px' : '2px' }} />
                          </button>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {artist.isTakingBookings ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="admin-btn outline" onClick={() => openArtistModal(artist)}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Joined Date</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="admin-empty-state">
                          <Users size={40} />
                          <h3>No clients found</h3>
                        </div>
                      </td>
                    </tr>
                  )}
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td>
                        <div className="admin-table-user">
                          <div className="admin-table-avatar">{client.name[0]}</div>
                          <div>
                            <div className="admin-table-name">{client.name}</div>
                            <div className="admin-table-email">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td>{client.clientProfile?.location || '-'}</td>
                      <td>
                        <button className="admin-btn danger" onClick={() => handleDeleteUser(client.id, 'client')} disabled={actioning}>
                          Delete Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Artist Detail Modal */}
      {selectedArtist && (
        <div className="admin-modal-overlay" onClick={() => setSelectedArtist(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal__close" onClick={() => setSelectedArtist(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div className="admin-table-avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                {selectedArtist.profileImageUrl ? <img src={`${API_BASE}${selectedArtist.profileImageUrl}`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : selectedArtist.user.name[0]}
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', color: '#0f172a' }}>{selectedArtist.user.name}</h2>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedArtist.user.email} | {selectedArtist.location}</div>
                <div style={{ marginTop: 8 }}>
                  <span className={`admin-badge ${selectedArtist.verificationStatus.toLowerCase()}`}>{selectedArtist.verificationStatus}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
              <button className="admin-btn outline" onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
              </button>
              <button className="admin-btn danger" onClick={() => handleDeleteUser(selectedArtist.id, 'artist')}>
                Delete Artist
              </button>
            </div>

            {isEditMode ? (
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Verification Status</label>
                  <select style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }} value={editFormData.verificationStatus} onChange={e => setEditFormData({...editFormData, verificationStatus: e.target.value})}>
                    <option value="NOT_SUBMITTED">Not Submitted</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Bio</label>
                  <textarea style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }} rows={4} value={editFormData.bio} onChange={e => setEditFormData({...editFormData, bio: e.target.value})} />
                </div>
                <button className="admin-btn success" onClick={handleSaveEdit} disabled={actioning}>Save Changes</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 24 }}>
                {/* Admin Booking Override */}
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#0f172a' }}>Admin Booking Status Override</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button 
                      className="admin-toggle-switch" 
                      style={{ background: selectedArtist.isTakingBookings ? '#10b981' : '#cbd5e1' }}
                      onClick={() => toggleBookingStatusAdmin(selectedArtist.id, !!selectedArtist.isTakingBookings)}
                      disabled={actioning}
                    >
                      <div className="dot" style={{ left: selectedArtist.isTakingBookings ? '22px' : '2px' }} />
                    </button>
                    <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                      {selectedArtist.isTakingBookings ? 'Currently TAKING BOOKINGS' : 'Currently NOT TAKING BOOKINGS'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '8px 0 0' }}>This overrides the status instantly, ignoring the 48-hour artist cooldown.</p>
                </div>

                {selectedArtist.verificationStatus === 'PENDING' && (
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                    <h4 style={{ margin: '0 0 12px', color: '#0f172a' }}>Verification Actions</h4>
                    <textarea 
                      placeholder="Admin remarks (optional, sent to artist)..." 
                      style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 12 }} 
                      rows={3} 
                      value={remarks} 
                      onChange={e => setRemarks(e.target.value)} 
                    />
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="admin-btn success" onClick={() => handleVerify(selectedArtist.id)} disabled={actioning}>Approve</button>
                      <button className="admin-btn danger" onClick={() => handleReject(selectedArtist.id)} disabled={actioning}>Reject</button>
                    </div>
                  </div>
                )}
                
                {selectedArtist.verificationStatus === 'EDIT_REQUESTED' && (
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                     <h4 style={{ margin: '0 0 12px', color: '#0f172a' }}>Edit Requested</h4>
                     <button className="admin-btn success" onClick={() => handleApproveEdit(selectedArtist.id)} disabled={actioning}>Approve Edit Request</button>
                  </div>
                )}

                {selectedArtist.portfolioUrls.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', color: '#0f172a' }}>Portfolio</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                      {selectedArtist.portfolioUrls.map((url, i) => (
                        <img key={i} src={url.startsWith('/') ? `${API_BASE}${url}` : url} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }} alt="Portfolio" />
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedArtist.certificationFiles.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', color: '#0f172a' }}>Certifications</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedArtist.certificationFiles.map((url, i) => (
                        <a key={i} href={url.startsWith('/') ? `${API_BASE}${url}` : url} target="_blank" rel="noreferrer" style={{ padding: '8px 12px', background: '#f1f5f9', color: '#0f172a', textDecoration: 'none', borderRadius: 6, fontSize: '0.85rem', fontWeight: 500 }}>
                          Document {i+1} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
