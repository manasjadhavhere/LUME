import AdminDocuments from './AdminDocuments';
import AdminInsights from './AdminInsights';
import GeoLocationInput from '../../components/ui/GeoLocationInput';
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Users, BarChart2, Clock, X, Home, Briefcase, Settings, MapPin, Star, CreditCard, Download, CheckCircle, Activity, Search, RefreshCw, LogOut } from 'lucide-react';
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
  totalCollections: number;
  totalGst: number;
  records: any[];
}

interface ClientUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  bookingsAsClient?: { id: string; date: string; status: string; priceType: string; artist: { user: { name: string } }; paymentRecords: { id: string; totalCharged: number }[] }[];
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
  const { user, token, logout } = useAuth();
  const { execute, error: apiError } = useApi();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<ClientUser | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingArtists, setPendingArtists] = useState<ArtistProfile[]>([]);
  const [allArtists, setAllArtists] = useState<ArtistProfile[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [paymentSummaries, setPaymentSummaries] = useState<ArtistPaymentSummary[]>([]);
  const [lumeRevenue, setLumeRevenue] = useState<LumeRevenue | null>(null);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'artists' | 'clients' | 'payments' | 'activity'>('dashboard');
  
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [selectedPaymentArtist, setSelectedPaymentArtist] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [remarks, setRemarks] = useState('');
  
  const [actionMsg, setActionMsg] = useState('');
  const [actionMsgType, setActionMsgType] = useState<'success' | 'error'>('success');
  const [actioning, setActioning] = useState(false);

  const loadData = async () => {
    setInitialLoading(true); setLoadError('');
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
    if ([statsRes, pendingRes, allRes, clientsRes, paymentSummariesRes, revenueRes].some(r => r === null)) setLoadError('Some workspace data could not be loaded. Please retry.');
    setInitialLoading(false); setRevision(v => v + 1);
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    loadData();
  }, [user]);

  const displayMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setActionMsg(msg);
    setActionMsgType(type);
    setTimeout(() => setActionMsg(''), 6000);
  };

  const switchTab = (tab: 'dashboard' | 'artists' | 'clients' | 'payments' | 'activity') => {
    setActiveTab(tab); setSearch(''); setStatusFilter('all'); setSelectedClient(null);
    setSelectedArtist(null);
    setSelectedPaymentArtist(null);
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
    if (!window.confirm(`Permanently delete this ${role}? Accounts with booking history cannot be deleted.`)) return;
    setActioning(true);
    const res = await execute(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res) {
      displayMsg(`✅ ${role} deleted successfully!`);
      setSelectedArtist(null);
      loadData();
    }
    setActioning(false);
  };

  const handleRemoveDocument = async (artistId: string, fileUrl: string, type: 'certification' | 'portfolio') => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    setActioning(true);
    const res = await execute(`/api/admin/artists/${artistId}/documents`, { 
      method: 'DELETE',
      body: { fileUrl, type }
    });
    if (res) {
      displayMsg('✅ Document removed successfully!');
      if (selectedArtist && selectedArtist.id === artistId) {
        if (type === 'certification') {
          setSelectedArtist({ ...selectedArtist, certificationFiles: selectedArtist.certificationFiles.filter(f => f !== fileUrl) });
        } else {
          setSelectedArtist({ ...selectedArtist, portfolioUrls: selectedArtist.portfolioUrls.filter(u => u !== fileUrl) });
        }
      }
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
        await fetchPaymentDetails(selectedPaymentArtist.id); // refresh modal data
      }
      loadData(); // refresh summary list
    }
    setActioning(false);
  };

  const generateInvoice = (booking: any, record: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('LUME PAYMENT RECEIPT', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Payment Date: ${new Date(record.createdAt).toLocaleDateString()}`, 14, 30);
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
        [`Service: ${booking.service?.name || booking.priceType} on ${new Date(booking.date).toLocaleDateString()}`, `Rs ${record.basePortion.toFixed(2)}`],
        ['Commission (included in service value)', `Rs ${record.lumeCommission.toFixed(2)}`],
        ['GST collected', `Rs ${record.gstAmount.toFixed(2)}`],
        ['Total Paid', `Rs ${record.totalCharged.toFixed(2)}`]
      ],
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 130;
    doc.setFontSize(12);
    doc.text('Customer payment recorded', 14, finalY + 15);
    doc.text(`Artist payout: Rs ${record.artistPayout.toFixed(2)} (${record.payoutStatus})`, 14, finalY + 23);

    doc.save(`Receipt_${record.id}.pdf`);
  };

  const matches = (value: string) => value.toLowerCase().includes(search.toLowerCase().trim());
  const filteredArtists = allArtists.filter(a => matches([a.user.name, a.user.email, a.location, ...a.specialties].join(' ')) && (statusFilter === 'all' || (statusFilter === 'queue' ? ['PENDING', 'EDIT_REQUESTED'].includes(a.verificationStatus) : a.verificationStatus === statusFilter)));
  const filteredClients = clients.filter(c => matches([c.name, c.email, c.clientProfile?.location].join(' ')));
  const filteredPayments = paymentSummaries.filter(p => matches(p.user.name) && (statusFilter !== 'outstanding' || p.pendingPayout > 0));
  const showInsightArtist = (id: string) => { const artist = allArtists.find(a => a.id === id); if (artist) openArtistModal(artist); else displayMsg('Artist details are unavailable. Refresh the workspace.', 'error'); };
  const showCity = (city: string) => { switchTab('artists'); setSearch(city === 'Not specified' ? '' : city); };

  useEffect(() => {
    if (!selectedArtist && !selectedPaymentArtist && !selectedClient) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('.admin-layout [role="dialog"]');
    dialog?.querySelector<HTMLElement>('button, input, select, textarea, a[href]')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !actioning) { setSelectedArtist(null); setSelectedPaymentArtist(null); setSelectedClient(null); }
      if (event.key === 'Tab' && dialog) {
        const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')).filter(e => e.offsetParent !== null);
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [!!selectedArtist, !!selectedPaymentArtist, !!selectedClient, actioning]);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <Link to="/" className="admin-sidebar__brand" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <span className="lume-brand__mark"><img src="/logo.png" alt="" /></span><span className="admin-brand-wordmark">LUME<small>ADMIN CONSOLE</small></span>
          </Link>
        </div>
        <nav className="admin-sidebar__nav">
          <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => switchTab('dashboard')}>
            <BarChart2 size={18} />
            <span>Overview & insights</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => switchTab('artists')}>
            <Briefcase size={18} />
            <span>Artists & verifications</span>
            {pendingArtists.length > 0 && (
              <span className="admin-nav-badge">
                {pendingArtists.length}
              </span>
            )}
          </button>
          <button className={`admin-nav-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => switchTab('clients')}>
            <Users size={18} />
            <span>Clients</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => switchTab('payments')}>
            <CreditCard size={18} />
            <span>Payments & receipts</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => switchTab('activity')}><Activity size={18} /><span>Activity logs</span></button>
        </nav>
        <div className="admin-sidebar__footer"><div className="admin-sidebar-user"><strong>{user?.name}</strong><span>Administrator</span></div>
          <button className="admin-nav-item" onClick={() => navigate('/profile')}>
            <Home size={18} />
            <span>Back to Lume</span>
          </button>
          <button className="admin-nav-item" onClick={() => { logout(); navigate('/login'); }}><LogOut size={18} /><span>Sign out</span></button>
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
            {activeTab === 'activity' && 'Operations & activity'}
          </h1>
          <div className="admin-header__actions">
            <button className="admin-button" onClick={loadData} disabled={initialLoading || actioning} aria-label="Refresh workspace">
              <RefreshCw size={15} />
              <span>Sync</span>
            </button>
            <div className="admin-header-badge">
              <ShieldCheck size={15} color="#059669" />
              <span>Admin Portal</span>
            </div>
            {actionMsg && (
              <div style={{ background: actionMsgType === 'error' ? '#ef4444' : '#10b981', color: '#fff', padding: '6px 16px', borderRadius: 99, fontSize: '0.85rem', fontWeight: 600, animation: 'fadeIn 0.3s', maxWidth: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {actionMsg}
              </div>
            )}
          </div>
        </header>

        <div className="admin-content">
          {(loadError || apiError) && <div className="admin-feedback admin-feedback--error" role="alert">{loadError || apiError}<button onClick={loadData} disabled={initialLoading}>Retry</button></div>}
          {!stats ? (
            <div className="admin-loading">
              <Clock size={32} className="spinner" />
              <span>{initialLoading ? 'Loading workspace data…' : 'Workspace data is unavailable. Use Retry above.'}</span>
            </div>
          ) : activeTab === 'dashboard' ? (
            <>
              <AdminInsights onArtist={showInsightArtist} onCity={showCity} revision={revision} />

              {/* Growth & Verification Pipeline Charts */}
              {stats.charts && (
                <div className="admin-charts-grid admin-charts-grid--dual" style={{ marginTop: '28px' }}>
                  <div className="admin-chart-card">
                    <div className="admin-chart-header">
                      <div>
                        <h3 className="admin-chart-title">User & Artist Growth</h3>
                        <p className="admin-chart-subtitle">Monthly registration trajectory for clients and verified beauty artists</p>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <LineChart data={stats.charts.userGrowth} margin={{ top: 10, right: 16, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={8} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <RechartsTooltip contentStyle={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', fontSize: '0.85rem' }} />
                          <Legend wrapperStyle={{ paddingTop: 16 }} />
                          <Line type="monotone" name="Clients" dataKey="clients" stroke="#0f172a" strokeWidth={2.4} dot={{ r: 4, fill: '#0f172a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" name="Artists" dataKey="artists" stroke="#b85f77" strokeWidth={2.4} dot={{ r: 4, fill: '#b85f77', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <div className="admin-chart-header">
                      <div>
                        <h3 className="admin-chart-title">Artist Status Pipeline</h3>
                        <p className="admin-chart-subtitle">Distribution of artist profiles across verification states</p>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={stats.charts.verificationDist}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {stats.charts.verificationDist.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', fontSize: '0.85rem' }} />
                          <Legend wrapperStyle={{ paddingTop: 16 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'activity' ? (<AdminInsights activityOnly onArtist={showInsightArtist} onCity={showCity} revision={revision} />) : activeTab === 'artists' ? (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div><h3 className="admin-table-title">Artist directory</h3><p className="admin-muted">{filteredArtists.length} artists · {pendingArtists.length} awaiting attention</p></div>
                <div className="admin-toolbar"><label className="admin-search"><Search size={16} /><input aria-label="Search artists" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, city or specialty" /></label><select aria-label="Verification filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All statuses</option><option value="queue">Needs review</option><option value="VERIFIED">Verified</option><option value="NOT_SUBMITTED">Not submitted</option><option value="EDIT_APPROVED">Edit approved</option><option value="PENDING">Pending</option><option value="REJECTED">Rejected</option><option value="NOT_SUBMITTED">Not submitted</option><option value="EDIT_REQUESTED">Edit requested</option><option value="EDIT_APPROVED">Edit approved</option></select></div>
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
                    {filteredArtists.map(a => (
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
                              <span className="admin-user-email">{a.user.email}</span><div className="admin-specialties">{a.specialties.slice(0, 3).map(s => <span key={s}>{s}</span>)}</div>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#b48450' }}>
                            <Star size={14} fill="currentColor" />
                            <span style={{ color: '#4e343e', fontWeight: 600 }}>{a.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label className="admin-switch">
                              <input 
                                type="checkbox" 
                                checked={!!a.isTakingBookings} aria-label={`Allow bookings for ${a.user.name}`}
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
                    {filteredArtists.length === 0 && (
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
                <h3 className="admin-table-title">Client relationships</h3><label className="admin-search"><Search size={16} /><input aria-label="Search clients" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email or location" /></label>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Joined</th><th>Bookings / lifetime spend</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(c => (
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
                        <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td><td>{c.bookingsAsClient?.length || 0} bookings<br /><strong>₹{(c.bookingsAsClient || []).flatMap(b => b.paymentRecords).reduce((sum, r) => sum + r.totalCharged, 0).toLocaleString('en-IN')}</strong></td>
                        <td>{c.clientProfile?.location || 'N/A'}</td>
                        <td>
                          <button className="admin-text-button" onClick={() => setSelectedClient(c)}>View history</button><button disabled={actioning} className="admin-btn-icon admin-btn-icon--danger" onClick={() => handleDeleteUser(c.id, 'client')} title="Delete User">
                            <X size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredClients.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No clients found.</td>
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
                  <div className="admin-kpi-icon" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                    <CreditCard size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Platform commission (excl. GST)</div>
                    <div className="admin-kpi-value">₹{(lumeRevenue?.totalEarned || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">Customer collections</div>
                    <div className="admin-kpi-value">₹{(lumeRevenue?.totalCollections || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="admin-kpi-card">
                  <div className="admin-kpi-icon" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                    <Clock size={24} />
                  </div>
                  <div className="admin-kpi-info">
                    <div className="admin-kpi-label">GST collected</div>
                    <div className="admin-kpi-value">₹{(lumeRevenue?.totalGst || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="admin-table-card">
                <div className="admin-table-header">
                  <h3 className="admin-table-title">Artist payments</h3><div className="admin-toolbar"><label className="admin-search"><Search size={16} /><input aria-label="Search payments" value={search} onChange={e => setSearch(e.target.value)} placeholder="Artist name" /></label><select aria-label="Payout filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All artists</option><option value="outstanding">Outstanding payouts</option></select></div>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Artist Name</th>
                        <th>Total Earnings</th>
                        <th>Pending Payout</th>
                        <th>Route Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map(p => (
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
                          <td><span style={{ color: p.pendingPayout > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>₹{p.pendingPayout.toLocaleString()}</span></td>
                          <td>
                            {p.bankAccount?.isLinkedToRazorpay ? (
                              <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>⚡ Auto-Pay ON</span>
                            ) : p.bankAccount?.isVerified ? (
                              <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>⚠ Not Linked</span>
                            ) : p.bankAccount ? (
                              <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>⏳ Unverified</span>
                            ) : (
                              <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>No Bank</span>
                            )}
                          </td>
                          <td>
                            <button className="admin-btn-icon" onClick={() => fetchPaymentDetails(p.artistId)} title="View Payment Details" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', padding: '6px 14px', borderRadius: 8, width: 'auto', fontSize: '0.8rem', fontWeight: 600 }}>
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredPayments.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No payments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {selectedClient && <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Client booking history"><div className="modal-content admin-client-modal"><div className="admin-table-header"><div><h2>{selectedClient.name}</h2><p className="admin-muted">{selectedClient.email}</p></div><button className="admin-btn-icon" aria-label="Close client history" onClick={() => setSelectedClient(null)}><X size={20} /></button></div><div className="admin-client-history">{selectedClient.bookingsAsClient?.length ? selectedClient.bookingsAsClient.map(b => <div className="admin-summary-row" key={b.id}><div><strong>{b.artist.user.name}</strong><p className="admin-muted">{new Date(b.date).toLocaleDateString('en-IN')} · {b.priceType} · {b.status}</p></div><strong>₹{b.paymentRecords.reduce((sum, r) => sum + r.totalCharged, 0).toLocaleString('en-IN')}</strong></div>) : <div className="admin-empty">This client has no bookings yet.</div>}</div></div></div>}
      {/* Artist Management Modal */}
      {selectedArtist && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Manage account details">
          <div className="modal-content" style={{ maxWidth: 800, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Manage Artist: {selectedArtist.user.name}</h2>
              <button className="admin-btn-icon" aria-label="Close artist details" disabled={actioning} onClick={() => setSelectedArtist(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="admin-modal-columns">
                
                {/* Left Col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Profile Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {isEditMode ? (
                        <>
                          <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} placeholder="Name" style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none' }} />
                          <GeoLocationInput value={editFormData.location} onChange={location => setEditFormData({ ...editFormData, location })} />
                          <textarea value={editFormData.bio} onChange={e => setEditFormData({...editFormData, bio: e.target.value})} placeholder="Bio" style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', minHeight: 80 }} />
                          <div className="admin-edit-fields">
                            <label>Experience (years)<input type="number" min="0" max="80" value={editFormData.experience} onChange={e => setEditFormData({ ...editFormData, experience: Number(e.target.value) })} /></label>
                            <label>Certification<input value={editFormData.certification} onChange={e => setEditFormData({ ...editFormData, certification: e.target.value })} /></label>
                            <label>Badge<select value={editFormData.badge} onChange={e => setEditFormData({ ...editFormData, badge: e.target.value })}><option value="">None</option><option value="VERIFIED">Verified</option><option value="TOP_PICK">Top pick</option><option value="FEATURED">Featured</option><option value="NEW">New</option></select></label>
                            <label>Gender<select value={editFormData.gender} onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })}><option value="">Not specified</option><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="OTHER">Other</option><option value="PREFER_NOT_TO_SAY">Prefer not to say</option></select></label>
                            <label>Date of birth<input type="date" value={editFormData.dob} onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })} /></label>
                            <label>Instagram URL<input type="url" value={editFormData.instagramUrl} onChange={e => setEditFormData({ ...editFormData, instagramUrl: e.target.value })} /></label>
                            {(['startingPrice', 'weddingPrice', 'occasionPrice', 'hourlyPrice'] as const).map(field => <label key={field}>{{startingPrice: 'Starting price (INR)', weddingPrice: 'Bridal price (INR)', occasionPrice: 'Occasion price (INR)', hourlyPrice: 'Hourly price (INR)'}[field]}<input type="number" min="0" step="0.01" value={editFormData[field]} onChange={e => setEditFormData({ ...editFormData, [field]: Number(e.target.value) })} /></label>)}
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{selectedArtist.user.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14}/> {selectedArtist.location || 'No location'}</div>
                          <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>{selectedArtist.bio || 'No bio provided'}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Experience</span>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{selectedArtist.experience || 0} years</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Gender</span>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{selectedArtist.gender || 'Not specified'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Certification</span>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{selectedArtist.certification || 'None'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Specialties</span>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{selectedArtist.specialties?.length ? selectedArtist.specialties.join(', ') : 'None'}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <AdminDocuments certifications={selectedArtist.certificationFiles || []} portfolio={selectedArtist.portfolioUrls || []} busy={actioning} onRemove={(url, type) => handleRemoveDocument(selectedArtist.id, url, type)} />

                  {selectedArtist.bankAccount && (
                    <div>
                      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Bank Details</h3>
                      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Holder</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{selectedArtist.bankAccount.accountHolderName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Number</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'monospace', color: '#0f172a' }}>{selectedArtist.bankAccount.maskedAccountNumber}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>IFSC Code</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'monospace', color: '#0f172a' }}>{selectedArtist.bankAccount.ifscCode}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bank Name</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{selectedArtist.bankAccount.bankName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Type</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{selectedArtist.bankAccount.accountType}</span>
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
                            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
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
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Status & Settings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>Verification</span>
                        {isEditMode ? (
                          <select value={editFormData.verificationStatus} onChange={e => setEditFormData({...editFormData, verificationStatus: e.target.value})} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a' }}>
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

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>Taking Bookings</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Admin Override</div>
                        </div>
                        <label className="admin-switch">
                          <input 
                            type="checkbox" 
                            checked={!!selectedArtist.isTakingBookings} aria-label="Allow bookings for this artist"
                            disabled={actioning}
                            onChange={() => toggleBookingStatusAdmin(selectedArtist.id, !!selectedArtist.isTakingBookings)}
                          />
                          <span className="admin-switch-slider"></span>
                        </label>
                      </div>

                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Admin Actions</h3>
                    
                    {selectedArtist.verificationStatus === 'PENDING' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        <textarea 
                          placeholder="Optional remarks for verification..." 
                          value={remarks} 
                          onChange={(e) => setRemarks(e.target.value)} 
                          style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', fontSize: '0.875rem' }} 
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button onClick={() => handleVerify(selectedArtist.id)} disabled={actioning} style={{ flex: 1, padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Verify Artist</button>
                          <button onClick={() => handleReject(selectedArtist.id)} disabled={actioning} style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                        </div>
                      </div>
                    )}

                    {selectedArtist.verificationStatus === 'EDIT_REQUESTED' && (
                      <button onClick={() => handleApproveEdit(selectedArtist.id)} disabled={actioning} style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
                        Approve Edit Request
                      </button>
                    )}

                    {isEditMode ? (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={handleSaveEdit} disabled={actioning} style={{ flex: 1, padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
                        <button onClick={() => setIsEditMode(false)} style={{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setIsEditMode(true)} style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                        Edit Profile Details
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteUser(selectedArtist.user.id, 'artist')} 
                      disabled={actioning} 
                      style={{ width: '100%', padding: '10px', background: 'transparent', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Manage account details">
          <div className="modal-content" style={{ maxWidth: 800, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Payments: {selectedPaymentArtist.user.name}</h2>
              <button className="admin-btn-icon" aria-label="Close payment details" disabled={actioning} onClick={() => setSelectedPaymentArtist(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
              
              <div style={{ marginBottom: 24, padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Bank Account Details</h3>
                {selectedPaymentArtist.bankAccount ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Bank Name:</span> <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedPaymentArtist.bankAccount.bankName}</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Account Holder:</span> <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedPaymentArtist.bankAccount.accountHolderName}</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '0.8rem' }}>IFSC Code:</span> <div style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{selectedPaymentArtist.bankAccount.ifscCode}</div></div>
                      <div><span style={{ color: '#64748b', fontSize: '0.8rem' }}>Account Type:</span> <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedPaymentArtist.bankAccount.accountType}</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {selectedPaymentArtist.bankAccount.isVerified ? (
                        <>
                          <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> Verified
                          </span>
                          {selectedPaymentArtist.bankAccount.isLinkedToRazorpay ? (
                            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                              ⚡ On Razorpay Route (Auto-Pay Active)
                            </span>
                          ) : (
                            <>
                              <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                                ⚠ Not on Razorpay Route
                              </span>
                              <button
                                onClick={async () => {
                                  if (!window.confirm('Attempt to register this artist on Razorpay Route?')) return;
                                  setActioning(true);
                                  const res = await execute(`/api/admin/bank-accounts/${selectedPaymentArtist.bankAccount.id}/verify`, { method: 'PATCH' });
                                  if (res) {
                                    const r = res as any;
                                    if (r.routeRegistered) {
                                      displayMsg('✅ Artist registered on Razorpay Route! Auto-payouts now active.', 'success');
                                    } else {
                                      displayMsg(`⚠ Razorpay Route failed: ${r.errorDetail || 'Please check the gateway configuration'}`, 'error');
                                    }
                                    await fetchPaymentDetails(selectedPaymentArtist.id);
                                    loadData();
                                  }
                                  setActioning(false);
                                }}
                                disabled={actioning}
                                style={{ padding: '4px 10px', background: actioning ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: actioning ? 'not-allowed' : 'pointer' }}
                              >
                                {actioning ? '⏳...' : 'Retry Linking'}
                              </button>
                            </>
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
                              if (r.routeRegistered) {
                                displayMsg('✅ Artist registered on Razorpay Route! Auto-payouts now active.', 'success');
                              } else {
                                displayMsg(`⚠ Bank verified, but Razorpay Route failed: ${r.errorDetail || 'Please check the gateway configuration'}`, 'error');
                              }
                              await fetchPaymentDetails(selectedPaymentArtist.id);
                              loadData();
                            }
                            setActioning(false);
                          }}
                          disabled={actioning}
                          style={{ padding: '6px 14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {actioning ? '⏳ Processing...' : '✓ Verify & Enable Auto-Pay'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>No bank account added yet.</div>
                )}
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Booking Payments</h3>
              {selectedPaymentArtist.bookings.filter((b: any) => b.paymentRecords.length > 0).length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>No payments recorded for this artist.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {selectedPaymentArtist.bookings.filter((b: any) => b.paymentRecords.length > 0).map((booking: any) => (
                    <div key={booking.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Booking #{booking.id.slice(-6).toUpperCase()}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Client: {booking.client.name} | Date: {new Date(booking.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div style={{ padding: '16px' }}>
                        {booking.paymentRecords.map((record: any) => (
                          <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                                Total Charged: ₹{record.totalCharged.toLocaleString()}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Commission + collected GST: ₹{record.lumeTotal.toFixed(2)} | Artist Payout: <span style={{ color: '#059669', fontWeight: 700 }}>₹{record.artistPayout.toFixed(2)}</span>
                              </div>
                              {/* Transfer Status Badge */}
                              <div style={{ marginTop: 6 }}>
                                {record.transferStatus === 'SUCCESS' && (
                                  <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <CheckCircle size={11} /> Auto-Paid via Razorpay Route
                                  </span>
                                )}
                                {record.transferStatus === 'FAILED' && (
                                  <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                    ⚠ Auto-Transfer Failed — Manual Payout Needed
                                  </span>
                                )}
                                {record.transferStatus === 'NOT_LINKED' && (
                                  <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                    ⚡ Artist Not on Razorpay Route — Verify Bank to Enable Auto-Pay
                                  </span>
                                )}
                                {record.transferStatus === 'PENDING' && (
                                  <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                    Manual Payout Pending
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {['PENDING', 'FAILED'].includes(record.payoutStatus) ? (
                                <button 
                                  disabled={actioning} onClick={() => handleMarkPayoutCompleted(record.id)}
                                  style={{ padding: '6px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Mark Payout Done
                                </button>
                              ) : (
                                <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <CheckCircle size={14} /> {record.payoutStatus === 'COMPLETED' ? 'Paid' : 'In progress'}
                                </span>
                              )}
                              
                              <button 
                                onClick={() => generateInvoice(booking, record)}
                                disabled={actioning}
                                style={{ 
                                  padding: '6px 12px', 
                                  background: '#0f172a', 
                                  color: '#fff', 
                                  border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4
                                }}
                                title={record.payoutStatus === 'PENDING' ? 'Complete payout to generate invoice' : 'Download receipt'}
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
