import React, { useEffect, useState } from 'react';
import { useApi, apiFetch } from '../../hooks/useApi';
import { CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import './ArtistPages.css';

interface Booking {
  id: string;
  status: string;
  date: string;
  time: string;
  priceType: string;
  totalPaid: number;
  notes?: string;
  address?: string;
  createdAt: string;
  client: { name: string; email: string; phone?: string; avatarUrl?: string };
  service: { id: string; name: string; price: number; icon: string };
  review?: { rating: number };
}

type TabType = 'PENDING' | 'UPCOMING' | 'PAST';

const ArtistBookings: React.FC = () => {
  const { data, loading, execute } = useApi<Booking[]>();
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');

  useEffect(() => {
    execute('/api/artists/me/bookings');
  }, []);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (newStatus === 'CANCELLED' && !window.confirm('Are you sure you want to decline this booking request?')) {
      return;
    }
    
    try {
      const res = await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      }) as any;
      if (res.success) {
        execute('/api/artists/me/bookings');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  };

  const bookings = data || [];

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const upcomingBookings = bookings.filter(b => (b.status === 'ACCEPTED' || b.status === 'CONFIRMED') && new Date(b.date) >= new Date(new Date().setHours(0,0,0,0)));
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED' || (new Date(b.date) < new Date(new Date().setHours(0,0,0,0)) && b.status !== 'PENDING'));

  const displayedBookings = activeTab === 'PENDING' ? pendingBookings : activeTab === 'UPCOMING' ? upcomingBookings : pastBookings;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="status-badge status-badge--pending">Approval Pending</span>;
      case 'ACCEPTED': return <span className="status-badge" style={{ background: '#fef3c7', color: '#d97706' }}>Awaiting Payment</span>;
      case 'CONFIRMED': return <span className="status-badge status-badge--confirmed">Confirmed</span>;
      case 'COMPLETED': return <span className="status-badge status-badge--completed">Completed</span>;
      case 'CANCELLED': return <span className="status-badge status-badge--cancelled">Cancelled</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="artist-page" style={{ padding: '24px 32px', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="artist-page__header" style={{ flexShrink: 0, marginBottom: 24 }}>
        <h1 className="artist-page__title">Booking Requests</h1>
        <p className="artist-page__subtitle">Manage your incoming requests and upcoming appointments.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid rgba(42,26,31,0.1)', paddingBottom: 16 }}>
        <button onClick={() => setActiveTab('PENDING')} style={{ padding: '8px 16px', borderRadius: 99, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'PENDING' ? 'var(--dark)' : 'transparent', color: activeTab === 'PENDING' ? '#fff' : 'var(--mid)', transition: 'all 0.2s' }}>
          Pending Requests {pendingBookings.length > 0 && <span style={{ background: activeTab === 'PENDING' ? '#fff' : 'var(--rose-deep)', color: activeTab === 'PENDING' ? 'var(--dark)' : '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', marginLeft: 8 }}>{pendingBookings.length}</span>}
        </button>
        <button onClick={() => setActiveTab('UPCOMING')} style={{ padding: '8px 16px', borderRadius: 99, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'UPCOMING' ? 'var(--dark)' : 'transparent', color: activeTab === 'UPCOMING' ? '#fff' : 'var(--mid)', transition: 'all 0.2s' }}>
          Upcoming ({upcomingBookings.length})
        </button>
        <button onClick={() => setActiveTab('PAST')} style={{ padding: '8px 16px', borderRadius: 99, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'PAST' ? 'var(--dark)' : 'transparent', color: activeTab === 'PAST' ? '#fff' : 'var(--mid)', transition: 'all 0.2s' }}>
          History ({pastBookings.length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40, color: 'var(--mid)' }}>Loading bookings...</div>
        ) : displayedBookings.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(42,26,31,0.15)', borderRadius: 16, padding: 60, textAlign: 'center' }}>
            <CalendarIcon size={48} color="var(--rose-deep)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--dark)' }}>No {activeTab.toLowerCase()} bookings found</h3>
            <p style={{ color: 'var(--mid)' }}>When you receive new requests, they will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayedBookings.map((booking) => (
              <div key={booking.id} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(42,26,31,0.06)', border: '1px solid rgba(42,26,31,0.04)', display: 'flex', gap: 24, flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark)' }}>
                      {booking.client?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)' }}>{booking.client?.name || 'Client'}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--mid)', marginTop: 2 }}>{booking.client?.email} {booking.client?.phone ? `• ${booking.client.phone}` : ''}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 4 }}>₹{booking.totalPaid.toLocaleString()}</div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: '16px', background: 'rgba(42,26,31,0.02)', borderRadius: 12 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{booking.service?.icon}</span> {booking.service?.name || 'Custom Service'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark)', marginTop: 4 }}>
                      {new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} • {booking.time}
                    </div>
                  </div>
                  {(booking.address || booking.notes) && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details & Notes</span>
                      <div style={{ fontSize: '0.9rem', color: 'var(--dark)', marginTop: 4 }}>
                        {booking.address && <div style={{ marginBottom: 4 }}><strong>Location:</strong> {booking.address}</div>}
                        {booking.notes && <div><strong>Note:</strong> {booking.notes}</div>}
                      </div>
                    </div>
                  )}
                </div>

                {booking.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid rgba(42,26,31,0.06)' }}>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                      style={{ padding: '10px 24px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Decline Request
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                      style={{ padding: '10px 24px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, background: 'var(--success-color, #10b981)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                    >
                      <CheckCircle2 size={18} />
                      Accept Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistBookings;
