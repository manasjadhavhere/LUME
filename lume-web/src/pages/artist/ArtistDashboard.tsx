import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Star,
  IndianRupee,
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
      label: 'Monthly Earnings',
      value: stats ? `₹${(stats.thisMonthEarnings / 1000).toFixed(1)}k` : '₹0.0k',
      icon: <IndianRupee size={18} />,
      badge: '+0% vs last month',
      badgeClass: 'artist-metric-card__badge--green',
    },
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
    <div className="artist-page">
      {/* Editorial Header */}
      <div className="artist-page__header">
        <h1 className="artist-page__title">
          {greetingTime()}, {user?.name?.split(' ')[0] || 'Artist'}
        </h1>
        <p className="artist-page__subtitle">
          Here is your studio performance, upcoming appointments, and booking pipeline for today.
        </p>
      </div>

      {/* Metrics Strip */}
      <div className="artist-stats-strip">
        {metricCards.map((card, i) => (
          <div key={i} className="artist-metric-card">
            <div className="artist-metric-card__top">
              <span className="artist-metric-card__label">{card.label}</span>
              <div className="artist-metric-card__icon">
                {card.icon}
              </div>
            </div>

            <div className="artist-metric-card__value">{card.value}</div>

            <div className="artist-metric-card__footer">
              <span className={`artist-metric-card__badge ${card.badgeClass}`}>
                {card.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reliability & Studio Performance Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <div className="artist-panel" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Inquiry Response Rate
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)' }}>
              {stats?.responseRate ?? 0}%
            </span>
          </div>
          <div style={{ height: 8, background: '#f5efe9', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${stats?.responseRate ?? 0}%`,
                background: '#d97a8c',
                borderRadius: 99,
              }}
            />
          </div>
        </div>

        <div className="artist-panel" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Booking Completion Rate
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)' }}>
              {stats?.completionRate ?? 0}%
            </span>
          </div>
          <div style={{ height: 8, background: '#f5efe9', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${stats?.completionRate ?? 0}%`,
                background: '#16a34a',
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="dashboard-grid">
        {/* Itinerary Panel */}
        <div className="artist-panel" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)' }}>
          <div className="artist-panel__header" style={{ borderBottom: '1px solid rgba(42, 26, 31, 0.04)', padding: '24px 30px' }}>
            <div>
              <h2 className="artist-panel__title" style={{ fontSize: '1.25rem', letterSpacing: '-0.01em' }}>Today's Itinerary</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginTop: 6, fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link to="/artist-dashboard/calendar" className="artist-panel__action" style={{ background: 'var(--dark)', color: '#fff', padding: '10px 18px', borderRadius: 99, fontSize: '0.8rem' }}>
              <span>Open Calendar</span>
            </Link>
          </div>

          <div className="booking-list" style={{ padding: '12px 0' }}>
            {loading ? (
              <div className="artist-empty">
                <p className="artist-empty__text">Loading itinerary...</p>
              </div>
            ) : !stats?.upcomingBookings?.length ? (
              <div className="itinerary-empty-state" style={{ padding: '10px 30px 30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[9, 13, 16].map((hour) => (
                    <div key={hour} style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
                      <div style={{ width: 55, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-soft)', textAlign: 'right', paddingTop: 16 }}>
                        {hour === 9 ? '09:00' : hour === 13 ? '13:00' : '16:00'}
                      </div>
                      <div style={{ position: 'relative', width: 2, background: 'rgba(42, 26, 31, 0.04)', borderRadius: 2 }}>
                        <div style={{ position: 'absolute', top: 18, left: -4, width: 10, height: 10, borderRadius: '50%', background: '#fcfcfd', border: '2px solid rgba(42, 26, 31, 0.15)' }} />
                      </div>
                      <div style={{ flex: 1, padding: '16px 20px', borderRadius: 14, border: '1px dashed rgba(42, 26, 31, 0.15)', background: 'rgba(255,255,255,0.5)', color: 'var(--mid)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s', cursor: 'pointer' }} className="itinerary-slot-hover">
                        <CalendarX size={16} color="var(--text-soft)" />
                        <span style={{ fontWeight: 500 }}>Slot available for booking</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '10px 30px 30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {stats.upcomingBookings.map((booking) => (
                    <div key={booking.id} style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
                      <div style={{ width: 55, fontSize: '0.8rem', fontWeight: 700, color: 'var(--dark)', textAlign: 'right', paddingTop: 16 }}>
                        {booking.time}
                      </div>
                      <div style={{ position: 'relative', width: 2, background: 'rgba(42, 26, 31, 0.06)', borderRadius: 2 }}>
                        <div style={{ position: 'absolute', top: 18, left: -5, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '3px solid var(--rose-deep)' }} />
                      </div>
                      <div style={{ flex: 1, padding: '18px 22px', borderRadius: 16, background: '#fff', boxShadow: '0 4px 15px rgba(42, 26, 31, 0.04)', border: '1px solid rgba(42, 26, 31, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.2s' }} className="itinerary-booked-hover">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fdf6f0', color: 'var(--dark)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                            {(booking.client?.name || 'Client').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark)' }}>{booking.client?.name || 'Client'}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{booking.service.icon}</span> {booking.service.name}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark)', fontVariantNumeric: 'tabular-nums' }}>
                            ₹{booking.totalPaid.toLocaleString()}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Insights & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Premium Insight Card */}
          <div className="artist-panel" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fdf0f2 100%)', color: 'var(--dark)', border: '1px solid rgba(217, 122, 140, 0.25)', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(217, 122, 140, 0.08)' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'radial-gradient(circle, rgba(217, 122, 140, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ padding: '28px 26px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(42,26,31,0.05)' }}>
                  <Star size={12} color="#d97a8c" fill="#d97a8c" />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#d97a8c' }}>Pro Tip</span>
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em', lineHeight: 1.3, color: 'var(--dark)' }}>
                Stand out with a stunning portfolio.
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--mid)', marginBottom: 20, lineHeight: 1.5 }}>
                Studios with high-quality lookbooks receive up to 3x more inquiries.
              </p>
              <Link to="/artist-dashboard/profile" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', width: '100%', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(42,26,31,0.1)' }}>
                Update Portfolio
              </Link>
            </div>
          </div>

          {/* Clean Quick Actions */}
          <div className="artist-panel" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)' }}>
            <div className="artist-panel__header" style={{ padding: '20px 24px' }}>
              <h2 className="artist-panel__title" style={{ fontSize: '1.05rem' }}>Workspace Actions</h2>
            </div>
            <div className="artist-quick-actions" style={{ padding: '12px 16px' }}>
              <Link to="/artist-dashboard/profile" className="artist-quick-action" style={{ border: 'none', background: 'transparent', padding: '12px 8px' }}>
                <div className="artist-quick-action__icon" style={{ background: 'rgba(217, 122, 140, 0.1)', color: '#d97a8c', width: 38, height: 38 }}>
                  <TrendingUp size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Edit Services</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: 2 }}>Update pricing & offerings</div>
                </div>
              </Link>
              <Link to="/artist-dashboard/calendar" className="artist-quick-action" style={{ border: 'none', background: 'transparent', padding: '12px 8px' }}>
                <div className="artist-quick-action__icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', width: 38, height: 38 }}>
                  <Calendar size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Manage Availability</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: 2 }}>Block dates & times</div>
                </div>
              </Link>
            </div>
            
            {/* Minimal Profile Strength */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(42, 26, 31, 0.05)', background: 'rgba(255,255,255,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark)' }}>Profile Strength</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--rose-deep)' }}>
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
