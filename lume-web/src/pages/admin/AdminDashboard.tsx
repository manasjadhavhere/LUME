import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Users, Calendar, BarChart2, Clock, X, Home, Briefcase, ExternalLink, Settings, MapPin, Star, CreditCard, Download, CheckCircle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useApi, apiFetch } from '../../hooks/useApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  gender?: string;
  dob?: string;
  instagramUrl?: string;
  bankAccount?: {
    id: string;
    accountHolderName: string;
    maskedAccountNumber: string;
    ifscCode: string;
    bankName: string;
    accountType: string;
    isVerified: boolean;
    isLinkedToRazorpay?: boolean;
    razorpayLinkedAccountId?: string;
  };
  user: { id: string; name: string; email: string; avatarUrl?: string; createdAt: string; };
}

interface ArtistPaymentSummary {
  artistId: string;
  user: { name: string; avatarUrl?: string };
  bankAccount: any;
  totalBookings: number;
  bookingsWithPayment: number;
  totalCharged: number;
  totalLume: number;
  totalArtistDue: number;
  pendingPayout: number;
  completedPayout: number;
}

interface LumeRevenue {
  totalEarned: number;
  totalReceived: number;
  totalPending: number;
  records: any[];
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
  const [paymentSummaries, setPaymentSummaries] = useState<ArtistPaymentSummary[]>([]);
  const [lumeRevenue, setLumeRevenue] = useState<LumeRevenue | null>(null);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'artists' | 'clients' | 'payments'>('dashboard');
  
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [selectedPaymentArtist, setSelectedPaymentArtist] = useState<any>(null);
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
    const [statsRes, pendingRes, allRes, clientsRes, paymentSummariesRes, revenueRes] = await Promise.all([
      execute('/api/admin/stats') as Promise<Stats | null>,
      execute('/api/admin/artists/pending') as Promise<ArtistProfile[] | null>,
      execute('/api/admin/artists') as Promise<ArtistProfile[] | null>,
      execute('/api/admin/clients') as Promise<ClientUser[] | null>,
      execute('/api/admin/payments') as Promise<ArtistPaymentSummary[] | null>,
      execute('/api/admin/payments/lume') as Promise<LumeRevenue | null>,
    ]);
    if (statsRes) setStats(statsRes);
    if (pendingRes) setPendingArtists(pendingRes);
    if (allRes) setAllArtists(allRes);
    if (clientsRes) setClients(clientsRes);
    if (paymentSummariesRes) setPaymentSummaries(paymentSummariesRes);
    if (revenueRes) setLumeRevenue(revenueRes);
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
      gender: artist.gender || '',
      dob: artist.dob ? new Date(artist.dob).toISOString().split('T')[0] : '',
      instagramUrl: artist.instagramUrl || '',
    });
  };

  const fetchPaymentDetails = async (artistId: string) => {
    setActioning(true);
    const res = await execute(`/api/admin/payments/${artistId}`) as any;
    if (res) setSelectedPaymentArtist(res);
    setActioning(false);
  };

  const handleMarkPayoutCompleted = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to mark this payout as COMPLETED?')) return;
    setActioning(true);
    const res = await execute(`/api/admin/payments/${recordId}/mark-paid`, { method: 'PATCH' });
    if (res) {
      displayMsg('✅ Payout marked as completed.');
      if (selectedPaymentArtist) {
        fetchPaymentDetails(selectedPaymentArtist.id); // refresh modal data
      }
      loadData(); // refresh summary list
    }
    setActioning(false);
  };

  const generateInvoice = (booking: any, record: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('LUME INVOICE', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Payment ID: ${record.id}`, 14, 36);
    doc.text(`Booking ID: ${booking.id}`, 14, 42);

    doc.setFontSize(12);
    doc.text('Bill To:', 14, 55);
    doc.setFontSize(10);
    doc.text(`Client: ${booking.client.name}`, 14, 62);
    doc.text(`Email: ${booking.client.email}`, 14, 68);

    doc.setFontSize(12);
    doc.text('Artist Details:', 120, 55);
    doc.setFontSize(10);
    doc.text(`Artist: ${selectedPaymentArtist.user.name}`, 120, 62);

    // Table
    autoTable(doc, {
      startY: 80,
      head: [['Description', 'Amount']],
      body: [
        [`Service: ${booking.service?.name || booking.priceType} on ${new Date(booking.date).toLocaleDateString()}`, `Rs ${record.totalCharged.toFixed(2)}`],
        ['Platform Fee (5%)', `Rs ${record.lumeCommission.toFixed(2)}`],
        ['GST (18%)', `Rs ${record.gstAmount.toFixed(2)}`],
        ['Total Paid', `Rs ${record.totalCharged.toFixed(2)}`]
      ],
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 130;
    doc.setFontSize(12);
    doc.text('Payment Status: COMPLETED', 14, finalY + 15);
    doc.text(`Net Amount to Artist: Rs ${record.artistPayout.toFixed(2)}`, 14, finalY + 23);

    doc.save(`Invoice_${record.id}.pdf`);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <Link to="/" className="admin-sidebar__brand">
            <div className="admin-sidebar__brand-dot"></div>
            LUME
          </Link>
        </div>
        <nav className="admin-sidebar__nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart2 size={18} />
            <span>Overview</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>
            <Briefcase size={18} />
            <span>Artists</span>
            {pendingArtists.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem' }}>
                {pendingArtists.length}
              </span>
            )}
          </button>
          <button className={`admin-nav-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
            <Users size={18} />
            <span>Clients</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            <CreditCard size={18} />
            <span>Payments</span>
          </button>
        </nav>
        <div className="admin-sidebar__footer">
          <button className="admin-nav-item" onClick={() => navigate('/profile')}>
            <Home size={18} />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header__title">
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'artists' && 'Artist Management'}
            {activeTab === 'clients' && 'Client Directory'}
            {activeTab === 'payments' && 'Artist Payments & Revenue'}
          </h1>
          <div className="admin-header__actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: '6px 16px', borderRadius: 99, border: '1px solid #e2e8f0' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Admin Portal</span>
            </div>
            {actionMsg && (
              <div style={{ background: '#10b981', color: '#fff', padding: '6px 16px', borderRadius: 99, fontSize: '0.85rem', fontWeight: 600, animation: 'fadeIn 0.3s' }}>
                {actionMsg}
              </div>
            )}
          </div>
        </header>

        <div className="admin-content">
          {!stats ? (
            <div className="admin-loading">
              <Clock size={32} className="spinner" />
              <span>Loading workspace data...</span>
            </div>
          ) : activeTab === 'dashboard' ? (
            <>
              {/* KPIs */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <Users size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Total Users</div>
                    <div className="admin-kpi-value">{stats.totalUsers}</div>
                  </div>
                </div>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                    <Briefcase size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Total Artists</div>
                    <div className="admin-kpi-value">{stats.totalArtists}</div>
                  </div>
                </div>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                    <Clock size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Pending Verifications</div>
                    <div className="admin-kpi-value">{stats.pendingVerifications}</div>
                  </div>
                </div>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
                    <Calendar size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Total Bookings</div>
                    <div className="admin-kpi-value">{stats.totalBookings}</div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              {stats.charts && (
                <div className="admin-charts-grid">
                  {/* User Growth Chart */}
                  <div className="admin-chart-card">
                    <div className="admin-chart-header">
                      <h3 className="admin-chart-title">User Growth</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={stats.charts.userGrowth} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                          <Legend wrapperStyle={{ paddingTop: 20 }} />
                          <Line type="monotone" name="Clients" dataKey="clients" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" name="Artists" dataKey="artists" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#e11d48', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Verification Distribution */}
                  <div className="admin-chart-card">
                    <div className="admin-chart-header">
                      <h3 className="admin-chart-title">Artist Status</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={stats.charts.verificationDist}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {stats.charts.verificationDist.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                          <Legend wrapperStyle={{ paddingTop: 20 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'artists' ? (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <h3 className="admin-table-title">Registered Artists</h3>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Artist</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Rating</th>
                      <th>Bookings Toggle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allArtists.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div className="admin-user-cell">
                            {a.profileImageUrl || a.user.avatarUrl ? (
                              <img src={a.profileImageUrl || a.user.avatarUrl} alt={a.user.name} className="admin-user-avatar" />
                            ) : (
                              <div className="admin-user-avatar">{a.user.name.charAt(0)}</div>
                            )}
                            <div className="admin-user-details">
                              <span className="admin-user-name">{a.user.name}</span>
                              <span className="admin-user-email">{a.user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge--${a.verificationStatus === 'VERIFIED' ? 'success' : a.verificationStatus === 'PENDING' ? 'warning' : 'danger'}`}>
                            {a.verificationStatus}
                          </span>
                        </td>
                        <td>{a.location || 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                            <Star size={14} fill="currentColor" />
                            <span style={{ color: '#334155', fontWeight: 600 }}>{a.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label className="admin-switch">
                              <input 
                                type="checkbox" 
                                checked={a.isTakingBookings}
                                disabled={actioning}
                                onChange={() => toggleBookingStatusAdmin(a.id, !!a.isTakingBookings)}
                              />
                              <span className="admin-switch-slider"></span>
                            </label>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.isTakingBookings ? 'ON' : 'OFF'}</span>
                          </div>
                        </td>
                        <td>
                          <button className="admin-btn-icon" onClick={() => openArtistModal(a)} title="Manage Artist">
                            <Settings size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {allArtists.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No artists found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'clients' ? (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <h3 className="admin-table-title">Registered Clients</h3>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Joined</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">{c.name.charAt(0)}</div>
                            <div className="admin-user-details">
                              <span className="admin-user-name">{c.name}</span>
                              <span className="admin-user-email">{c.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>{c.clientProfile?.location || 'N/A'}</td>
                        <td>
                          <button className="admin-btn-icon admin-btn-icon--danger" onClick={() => handleDeleteUser(c.id, 'client')} title="Delete User">
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No clients found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'payments' ? (
            <div className="admin-payments">
              <div className="admin-kpi-grid" style={{ marginBottom: 24 }}>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <CreditCard size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Lume Total Revenue</div>
                    <div className="admin-kpi-value">₹{(lumeRevenue?.totalEarned || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Revenue Received</div>
                    <div className="admin-kpi-value">₹{(lumeRevenue?.totalReceived || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                    <Clock size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Pending Revenue</div>
                    <div className="admin-kpi-value">₹{(lumeRevenue?.totalPending || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h3 className="admin-table-title">Artist Payments</h3>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Artist Name</th>
                        <th>Total Earnings</th>
                        <th>Pending Payout</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentSummaries.map(p => (
                        <tr key={p.artistId}>
                          <td>
                            <div className="admin-user-cell">
                              {p.user.avatarUrl ? (
                                <img src={p.user.avatarUrl} alt={p.user.name} className="admin-user-avatar" />
                              ) : (
                                <div className="admin-user-avatar">{p.user.name.charAt(0)}</div>
                              )}
                              <div className="admin-user-details">
                                <span className="admin-user-name">{p.user.name}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontWeight: 600 }}>₹{p.totalArtistDue.toLocaleString()}</span></td>
                          <td><span style={{ color: p.pendingPayout > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>₹{p.pendingPayout.toLocaleString()}</span></td>
                          <td>
                            <button className="admin-btn-icon" onClick={() => fetchPaymentDetails(p.artistId)} title="View Payment Details" style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, width: 'auto' }}>
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paymentSummaries.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No payments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Artist Management Modal */}
      {selectedArtist && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 800, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manage Artist: {selectedArtist.user.name}</h2>
              <button className="admin-btn-icon" onClick={() => setSelectedArtist(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                
                {/* Left Col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Profile Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {isEditMode ? (
                        <>
                          <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} placeholder="Name" style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none' }} />
                          <input type="text" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} placeholder="Location" style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none' }} />
                          <textarea value={editFormData.bio} onChange={e => setEditFormData({...editFormData, bio: e.target.value})} placeholder="Bio" style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', minHeight: 80 }} />
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedArtist.user.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14}/> {selectedArtist.location || 'No location'}</div>
                          <div style={{ fontSize: '0.875rem', color: '#475569' }}>{selectedArtist.bio || 'No bio provided'}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Experience</span>
                              <div style={{ fontSize: '0.875rem' }}>{selectedArtist.experience || 0} years</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Gender</span>
                              <div style={{ fontSize: '0.875rem' }}>{selectedArtist.gender || 'Not specified'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Certification</span>
                              <div style={{ fontSize: '0.875rem' }}>{selectedArtist.certification || 'None'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Specialties</span>
                              <div style={{ fontSize: '0.875rem' }}>{selectedArtist.specialties?.length ? selectedArtist.specialties.join(', ') : 'None'}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Documents & Links</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedArtist.portfolioUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'none' }}>
                          <ExternalLink size={14} /> Portfolio Link {i+1}
                        </a>
                      ))}
                      {selectedArtist.certificationFiles.map((file, i) => (
                        <a key={i} href={file} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'none' }}>
                          <ExternalLink size={14} /> Certificate {i+1}
                        </a>
                      ))}
                    </div>
                  </div>
                  
                  {selectedArtist.bankAccount && (
                    <div>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Bank Details</h3>
                      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Holder</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{selectedArtist.bankAccount.accountHolderName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Number</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, fontFamily: 'monospace' }}>{selectedArtist.bankAccount.maskedAccountNumber}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>IFSC Code</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, fontFamily: 'monospace' }}>{selectedArtist.bankAccount.ifscCode}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bank Name</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{selectedArtist.bankAccount.bankName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Type</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{selectedArtist.bankAccount.accountType}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verification</span>
                          <span className={`admin-badge admin-badge--${selectedArtist.bankAccount.isVerified ? 'success' : 'warning'}`}>
                            {selectedArtist.bankAccount.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                          </span>
                        </div>
                        {selectedArtist.bankAccount.isLinkedToRazorpay && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Razorpay Route</span>
                            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                              🔗 Linked ({selectedArtist.bankAccount.razorpayLinkedAccountId})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>


                {/* Right Col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Status & Settings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Verification</span>
                        {isEditMode ? (
                          <select value={editFormData.verificationStatus} onChange={e => setEditFormData({...editFormData, verificationStatus: e.target.value})} style={{ padding: '6px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                            <option value="PENDING">Pending</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="EDIT_REQUESTED">Edit Requested</option>
                          </select>
                        ) : (
                          <span className={`admin-badge admin-badge--${selectedArtist.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}`}>
                            {selectedArtist.verificationStatus}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Taking Bookings</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Admin Override</div>
                        </div>
                        <label className="admin-switch">
                          <input 
                            type="checkbox" 
                            checked={selectedArtist.isTakingBookings}
                            disabled={actioning}
                            onChange={() => toggleBookingStatusAdmin(selectedArtist.id, !!selectedArtist.isTakingBookings)}
                          />
                          <span className="admin-switch-slider"></span>
                        </label>
                      </div>

                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Admin Actions</h3>
                    
                    {selectedArtist.verificationStatus === 'PENDING' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        <textarea 
                          placeholder="Optional remarks for verification..." 
                          value={remarks} 
                          onChange={(e) => setRemarks(e.target.value)} 
                          style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', fontSize: '0.875rem' }} 
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button onClick={() => handleVerify(selectedArtist.id)} disabled={actioning} style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Verify Artist</button>
                          <button onClick={() => handleReject(selectedArtist.id)} disabled={actioning} style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                        </div>
                      </div>
                    )}

                    {selectedArtist.verificationStatus === 'EDIT_REQUESTED' && (
                      <button onClick={() => handleApproveEdit(selectedArtist.id)} disabled={actioning} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>
                        Approve Edit Request
                      </button>
                    )}

                    {isEditMode ? (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={handleSaveEdit} disabled={actioning} style={{ flex: 1, padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                        <button onClick={() => setIsEditMode(false)} style={{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setIsEditMode(true)} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                        Edit Profile Details
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteUser(selectedArtist.user.id, 'artist')} 
                      disabled={actioning} 
                      style={{ width: '100%', padding: '10px', background: 'transparent', color: '#ef4444', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <X size={16} /> Delete Artist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPaymentArtist && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 800, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Payments: {selectedPaymentArtist.user.name}</h2>
              <button className="admin-btn-icon" onClick={() => setSelectedPaymentArtist(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
              
              <div style={{ marginBottom: 24, padding: '16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Bank Account Details</h3>
                {selectedPaymentArtist.bankAccount ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Bank Name:</span> <div style={{ fontWeight: 600 }}>{selectedPaymentArtist.bankAccount.bankName}</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Account Holder:</span> <div style={{ fontWeight: 600 }}>{selectedPaymentArtist.bankAccount.accountHolderName}</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '0.8rem' }}>IFSC Code:</span> <div style={{ fontWeight: 600 }}>{selectedPaymentArtist.bankAccount.ifscCode}</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Account Type:</span> <div style={{ fontWeight: 600 }}>{selectedPaymentArtist.bankAccount.accountType}</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {selectedPaymentArtist.bankAccount.isVerified ? (
                        <>
                          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> Verified
                          </span>
                          {selectedPaymentArtist.bankAccount.isLinkedToRazorpay ? (
                            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                              ⚡ On Razorpay Route (Auto-Pay Active)
                            </span>
                          ) : (
                            <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                              ⚠ Not on Razorpay Route
                            </span>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={async () => {
                            if (!window.confirm('Verify this bank account and register the artist on Razorpay Route for automatic payouts?')) return;
                            setActioning(true);
                            const res = await execute(`/api/admin/bank-accounts/${selectedPaymentArtist.bankAccount.id}/verify`, { method: 'PATCH' });
                            if (res) {
                              const r = res as any;
                              displayMsg('✅ Bank account verified! ' + (r.routeRegistered ? 'Artist registered on Razorpay Route.' : 'Note: Route registration skipped (check logs).'));
                              fetchPaymentDetails(selectedPaymentArtist.id);
                            }
                            setActioning(false);
                          }}
                          disabled={actioning}
                          style={{ padding: '5px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✓ Verify & Enable Auto-Pay
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>No bank account added yet.</div>
                )}
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Booking Payments</h3>
              {selectedPaymentArtist.bookings.filter((b: any) => b.paymentRecords.length > 0).length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748b', background: '#f1f5f9', borderRadius: 8 }}>No payments recorded for this artist.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {selectedPaymentArtist.bookings.filter((b: any) => b.paymentRecords.length > 0).map((booking: any) => (
                    <div key={booking.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Booking #{booking.id.slice(-6).toUpperCase()}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Client: {booking.client.name} | Date: {new Date(booking.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div style={{ padding: '16px' }}>
                        {booking.paymentRecords.map((record: any) => (
                          <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                Total Charged: ₹{record.totalCharged.toLocaleString()}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Lume Cut (5% + 18% GST): ₹{record.lumeTotal.toFixed(2)} | Artist Payout: <span style={{ color: '#10b981', fontWeight: 600 }}>₹{record.artistPayout.toFixed(2)}</span>
                              </div>
                              {/* Transfer Status Badge */}
                              <div style={{ marginTop: 6 }}>
                                {record.transferStatus === 'SUCCESS' && (
                                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <CheckCircle size={11} /> Auto-Paid via Razorpay Route
                                  </span>
                                )}
                                {record.transferStatus === 'FAILED' && (
                                  <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                    ⚠ Auto-Transfer Failed — Manual Payout Needed
                                  </span>
                                )}
                                {record.transferStatus === 'NOT_LINKED' && (
                                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                    ⚡ Artist Not on Razorpay Route — Verify Bank to Enable Auto-Pay
                                  </span>
                                )}
                                {record.transferStatus === 'PENDING' && (
                                  <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                    Manual Payout Pending
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {record.payoutStatus === 'PENDING' ? (
                                <button 
                                  onClick={() => handleMarkPayoutCompleted(record.id)}
                                  style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Mark Payout Done
                                </button>
                              ) : (
                                <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <CheckCircle size={14} /> Paid
                                </span>
                              )}
                              
                              <button 
                                onClick={() => generateInvoice(booking, record)}
                                disabled={record.payoutStatus === 'PENDING'}
                                style={{ 
                                  padding: '6px 12px', 
                                  background: record.payoutStatus === 'PENDING' ? '#e2e8f0' : '#1e293b', 
                                  color: record.payoutStatus === 'PENDING' ? '#94a3b8' : '#fff', 
                                  border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: record.payoutStatus === 'PENDING' ? 'not-allowed' : 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4
                                }}
                                title={record.payoutStatus === 'PENDING' ? 'Complete payout to generate invoice' : 'Download Invoice'}
                              >
                                <Download size={14} /> Invoice
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
