import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  CalendarX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import './ArtistPages.css';

interface DashboardStats {
  stats: {
    pendingBookings: number;
    completedBookings: number;
    upcomingBookings: Array<{
      id: string;
      date: string;
      time: string;
      totalPaid: number;
      status: string;
      client: { name: string; avatarUrl?: string };
      service: { name: string; icon: string };
    }>;
    thisMonthEarnings: number;
    totalEarnings: number;
    rating: number;
    reviewCount: number;
    responseRate: number;
    completionRate: number;
  };
}

const ArtistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, execute } = useApi<DashboardStats>();

  useEffect(() => {
    execute('/api/artists/me/stats');
  }, []);

  const stats = data?.stats;
  const profile = user?.artistProfile;

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const metricCards = [
    {
      label: 'Overall Rating',
      value: stats ? stats.rating.toFixed(1) : '0.0',
      icon: <Star size={18} />,
      badge: `${stats?.reviewCount || 0} Verified Reviews`,
      badgeClass: '',
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingBookings ?? 0,
      icon: <Clock size={18} />,
      badge: 'Action required',
      badgeClass: '',
    },
    {
      label: 'Completed Looks',
      value: stats?.completedBookings ?? 0,
      icon: <CheckCircle2 size={18} />,
      badge: '100% on time',
      badgeClass: 'artist-metric-card__badge--green',
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'status-badge--pending',
      CONFIRMED: 'status-badge--confirmed',
      COMPLETED: 'status-badge--completed',
      CANCELLED: 'status-badge--cancelled',
    };
    return map[status] || 'status-badge--pending';
  };

  return (
    <div className="artist-page" style={{ padding: '24px 32px', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Editorial Header */}
      <div className="artist-page__header" style={{ marginBottom: 20, flexShrink: 0 }}>
        <h1 className="artist-page__title">
          {greetingTime()}, {user?.name?.split(' ')[0] || 'Artist'}
        </h1>
        <p className="artist-page__subtitle">
          Here is your studio performance, upcoming appointments, and booking pipeline for today.
        </p>
      </div>

      {/* Pro Tip Ribbon */}
      <div style={{ background: 'linear-gradient(90deg, #312e81 0%, #4338ca 100%)', color: '#fff', padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0, boxShadow: '0 4px 12px rgba(67, 56, 202, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: '50%', display: 'flex' }}>
            <Star size={16} fill="#fff" />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            <strong style={{ fontWeight: 700, marginRight: 6 }}>PRO TIP:</strong>
            Stand out with a stunning portfolio. Studios with high-quality lookbooks receive up to 3x more inquiries.
          </span>
        </div>
        <Link to="/artist-dashboard/profile" style={{ background: '#fff', color: '#312e81', padding: '8px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s' }}>
          Update Portfolio
        </Link>
      </div>

      {/* Pending Requests Alert Banner */}
      {stats?.pendingBookings ? (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              <strong style={{ fontWeight: 700, marginRight: 6 }}>Action Required:</strong>
              You have {stats.pendingBookings} pending booking request{stats.pendingBookings > 1 ? 's' : ''}! Review them to secure your schedule.
            </span>
          </div>
          <Link to="/artist-dashboard/bookings" style={{ background: '#dc2626', color: '#fff', padding: '8px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s' }}>
            Review Requests
          </Link>
        </div>
      ) : null}

      {/* Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20, flexShrink: 0 }}>
        {metricCards.map((card, i) => (
          <div key={i} className="artist-metric-card" style={{ padding: '16px 20px', marginBottom: 0 }}>
            <div className="artist-metric-card__top">
              <span className="artist-metric-card__label">{card.label}</span>
              <div className="artist-metric-card__icon">
                {card.icon}
              </div>
            </div>

            <div className="artist-metric-card__value" style={{ fontSize: '1.8rem', margin: '8px 0' }}>{card.value}</div>

            <div className="artist-metric-card__footer">
              <span className={`artist-metric-card__badge ${card.badgeClass}`}>
                {card.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Itinerary Panel */}
        <div className="artist-panel" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="artist-panel__header" style={{ borderBottom: '1px solid rgba(42, 26, 31, 0.04)', padding: '16px 24px', flexShrink: 0 }}>
            <div>
              <h2 className="artist-panel__title" style={{ fontSize: '1.15rem', letterSpacing: '-0.01em' }}>Today's Itinerary</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: 4, fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link to="/artist-dashboard/calendar" className="artist-panel__action" style={{ background: 'var(--dark)', color: '#fff', padding: '8px 16px', borderRadius: 99, fontSize: '0.75rem' }}>
              <span>Open Calendar</span>
            </Link>
          </div>

          <div className="booking-list" style={{ padding: '12px 24px', overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div className="artist-empty" style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="artist-empty__text">Loading itinerary...</p>
              </div>
            ) : !stats?.upcomingBookings?.length ? (
              <div className="itinerary-empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[9, 13, 16].map((hour) => (
                  <div key={hour} style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                    <div style={{ width: 45, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)', textAlign: 'right', paddingTop: 14 }}>
                      {hour === 9 ? '09:00' : hour === 13 ? '13:00' : '16:00'}
                    </div>
                    <div style={{ position: 'relative', width: 2, background: 'rgba(42, 26, 31, 0.04)', borderRadius: 2 }}>
                      <div style={{ position: 'absolute', top: 16, left: -4, width: 10, height: 10, borderRadius: '50%', background: '#ffffff', border: '2px solid rgba(42, 26, 31, 0.15)' }} />
                    </div>
                    <div style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px dashed rgba(42, 26, 31, 0.15)', background: 'rgba(255,255,255,0.5)', color: 'var(--mid)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', cursor: 'pointer' }} className="itinerary-slot-hover">
                      <CalendarX size={14} color="var(--text-soft)" />
                      <span style={{ fontWeight: 500 }}>Slot available for booking</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.upcomingBookings.map((booking) => {
                  const isPending = booking.status === 'PENDING';
                  const displayStatus = isPending ? 'Approval Pending' : booking.status === 'ACCEPTED' ? 'Awaiting Payment' : booking.status === 'CONFIRMED' ? 'Booking Done' : booking.status;
                  
                  return (
                  <div key={booking.id} style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                    <div style={{ width: 45, fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark)', textAlign: 'right', paddingTop: 14 }}>
                      {booking.time}
                    </div>
                    <div style={{ position: 'relative', width: 2, background: 'rgba(42, 26, 31, 0.06)', borderRadius: 2 }}>
                      <div style={{ position: 'absolute', top: 16, left: -5, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '3px solid var(--rose-deep)' }} />
                    </div>
                    <div style={{ flex: 1, padding: '14px 18px', borderRadius: 14, background: '#fff', boxShadow: '0 4px 15px rgba(42, 26, 31, 0.04)', border: '1px solid rgba(42, 26, 31, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.2s' }} className="itinerary-booked-hover">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ffffff', color: 'var(--dark)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                          {(booking.client?.name || 'Client').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark)' }}>{booking.client?.name || 'Client'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--mid)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>{booking.service.icon}</span> {booking.service.name}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark)', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{booking.totalPaid.toLocaleString()}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <span className={`status-badge ${getStatusBadgeClass(booking.status)}`} style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                            {displayStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Insights & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Clean Quick Actions */}
          <div className="artist-panel" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="artist-panel__header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(42, 26, 31, 0.04)' }}>
              <h2 className="artist-panel__title" style={{ fontSize: '1rem' }}>Workspace Actions</h2>
            </div>
            <div className="artist-quick-actions" style={{ padding: '12px', flex: 1 }}>
              <Link to="/artist-dashboard/profile" className="artist-quick-action" style={{ border: 'none', background: 'transparent', padding: '10px 8px', marginBottom: 8 }}>
                <div className="artist-quick-action__icon" style={{ background: 'rgba(217, 122, 140, 0.1)', color: '#d97a8c', width: 34, height: 34 }}>
                  <TrendingUp size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Edit Services</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: 2 }}>Update pricing & offerings</div>
                </div>
              </Link>
              <Link to="/artist-dashboard/calendar" className="artist-quick-action" style={{ border: 'none', background: 'transparent', padding: '10px 8px' }}>
                <div className="artist-quick-action__icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', width: 34, height: 34 }}>
                  <Calendar size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Manage Availability</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: 2 }}>Block dates & times</div>
                </div>
              </Link>
            </div>
            
            {/* Minimal Profile Strength */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(42, 26, 31, 0.05)', background: 'rgba(255,255,255,0.4)', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--dark)' }}>Profile Strength</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose-deep)' }}>
                  {profile?.bio && profile?.certification && profile?.specialties?.length ? '100%' : '85%'}
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(42, 26, 31, 0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: profile?.bio && profile?.certification && profile?.specialties?.length ? '100%' : '85%',
                    background: '#d97a8c',
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
