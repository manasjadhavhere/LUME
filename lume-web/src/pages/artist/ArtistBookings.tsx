import React, { useEffect, useState } from 'react';
import { useApi, apiFetch } from '../../hooks/useApi';
import { CheckCircle2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import type { ClientBeautyPreferences } from '../../context/AuthContext';
import { hasBookingDateTimePassed, buildGoogleMapsUrl } from '../../utils/bookingTime';
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
  latitude?: number;
  longitude?: number;
  endTime?: string;
  createdAt: string;
  client: { name: string; email: string; phone?: string; avatarUrl?: string; clientProfile?: { beautyPreferences?: ClientBeautyPreferences } };
  service: { id: string; name: string; price: number; icon: string };
  review?: { rating: number };
}

type TabType = 'PENDING' | 'UPCOMING' | 'PAST';

const ArtistBookings: React.FC = () => {
  const { data, loading, error, execute } = useApi<Booking[]>();
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  useEffect(() => {
    execute('/api/artists/me/bookings');
  }, [execute]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (newStatus === 'CANCELLED' && !window.confirm('Are you sure you want to decline this booking request?')) {
      return;
    }
    
    setUpdatingBookingId(bookingId);
    try {
      const token = localStorage.getItem('lume_token') || undefined;
      const res = await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
        token,
      }) as any;
      if (res) {
        execute('/api/artists/me/bookings');
        if (newStatus === 'ACCEPTED' || newStatus === 'CONFIRMED') {
          setActiveTab('UPCOMING');
        } else if (newStatus === 'CANCELLED' || newStatus === 'COMPLETED') {
          setActiveTab('PAST');
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking status');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const bookings = data || [];

  const pendingBookings = bookings.filter(b => b.status === 'PENDING' && !hasBookingDateTimePassed(b));
  const upcomingBookings = bookings.filter(b => ['ACCEPTED', 'CONFIRMED', 'PARTIALLY_PAID'].includes(b.status) && !hasBookingDateTimePassed(b));
  const pastBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status) || hasBookingDateTimePassed(b));

  const displayedBookings = activeTab === 'PENDING' ? pendingBookings : activeTab === 'UPCOMING' ? upcomingBookings : pastBookings;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="status-badge status-badge--pending">Approval Pending</span>;
      case 'ACCEPTED': return <span className="status-badge" style={{ background: '#fef3c7', color: '#d97706' }}>Awaiting Payment</span>;
      case 'PARTIALLY_PAID': return <span className="status-badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>Advance Paid</span>;
      case 'CONFIRMED': return <span className="status-badge status-badge--confirmed">Confirmed</span>;
      case 'COMPLETED': return <span className="status-badge status-badge--completed">Completed</span>;
      case 'CANCELLED': return <span className="status-badge status-badge--cancelled">Cancelled</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="artist-page artist-bookings">
      <div className="artist-page__header" style={{ flexShrink: 0, marginBottom: 24 }}>
        <h1 className="artist-page__title">Booking Requests</h1>
        <p className="artist-page__subtitle">Manage your incoming requests and upcoming appointments.</p>
      </div>

      <div className="artist-bookings__tabs" role="group" aria-label="Booking status">
        {([['PENDING', 'Pending requests', pendingBookings.length], ['UPCOMING', 'Upcoming', upcomingBookings.length],
          ['PAST', 'History', pastBookings.length]] as const).map(([tab, label, count]) => (
          <button type="button" key={tab} aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}>
            {label} ({count})
          </button>
        ))}
      </div>

      <div>
        {error && <p role="alert">{error}</p>}
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
              <div key={booking.id} className="artist-bookings__card" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(42,26,31,0.06)', border: '1px solid rgba(42,26,31,0.04)', display: 'flex', gap: 24, flexDirection: 'column' }}>
                <div className="artist-bookings__card-head">
                  <div className="artist-bookings__client">
                    <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 14, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark)' }}>
                      {booking.client?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)' }}>{booking.client?.name || 'Client'}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--mid)', marginTop: 2 }}>{booking.client?.email} {booking.client?.phone ? `• ${booking.client.phone}` : ''}</p>
                    </div>
                  </div>
                  <div className="artist-bookings__price">
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 4 }}>₹{booking.totalPaid.toLocaleString()}</div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, padding: '16px', background: 'rgba(42,26,31,0.02)', borderRadius: 12 }}>
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
                        {typeof booking.latitude === 'number' && typeof booking.longitude === 'number' && <a href={buildGoogleMapsUrl(booking.latitude, booking.longitude)} target="_blank" rel="noreferrer">Open venue in Google Maps</a>}
                        {booking.notes && <div><strong>Note:</strong> {booking.notes}</div>}
                      </div>
                    </div>
                  )}
                </div>

                {booking.client?.clientProfile?.beautyPreferences && (
                  <details className="artist-bookings__preferences">
                    <summary>Beauty &amp; Style Profile</summary>
                    <dl>{Object.entries({
                      'Preferred looks': booking.client.clientProfile.beautyPreferences.styles?.join(', '),
                      'Skin type': booking.client.clientProfile.beautyPreferences.skinType,
                      'Undertone': booking.client.clientProfile.beautyPreferences.undertone,
                      'Product allergies & notes': booking.client.clientProfile.beautyPreferences.specialRequests,
                    }).filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
                  </details>
                )}

                {booking.status === 'PENDING' && activeTab === 'PENDING' && (
                  <div className="artist-bookings__actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid rgba(42,26,31,0.06)' }}>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                      disabled={updatingBookingId === booking.id}
                      style={{ padding: '10px 24px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', cursor: updatingBookingId === booking.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: updatingBookingId === booking.id ? 0.6 : 1 }}
                    >
                      {updatingBookingId === booking.id ? 'Declining...' : 'Decline Request'}
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                      disabled={updatingBookingId === booking.id}
                      style={{ padding: '10px 24px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, background: 'var(--success-color, #10b981)', color: '#fff', border: 'none', cursor: updatingBookingId === booking.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', opacity: updatingBookingId === booking.id ? 0.6 : 1 }}
                    >
                      {updatingBookingId === booking.id ? <Loader2 size={18} className="spinner" /> : <CheckCircle2 size={18} />}
                      {updatingBookingId === booking.id ? 'Accepting...' : 'Accept Booking'}
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
