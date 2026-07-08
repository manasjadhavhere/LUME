import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Star,
  IndianRupee,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  UserCheck,
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
      value: stats ? `₹${(stats.thisMonthEarnings / 1000).toFixed(1)}k` : '₹30.0k',
      icon: <IndianRupee size={18} />,
      badge: '+18% vs last month',
      badgeClass: 'artist-metric-card__badge--green',
      iconBg: '#fce8ec',
      iconColor: '#d97a8c',
    },
    {
      label: 'Overall Rating',
      value: stats ? stats.rating.toFixed(1) : '4.9',
      icon: <Star size={18} />,
      badge: `${stats?.reviewCount || 127} Verified Reviews`,
      badgeClass: '',
      iconBg: '#fdf6e9',
      iconColor: '#c9a96e',
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingBookings ?? '2',
      icon: <Clock size={18} />,
      badge: 'Action required',
      badgeClass: '',
      iconBg: '#fef9c3',
      iconColor: '#ca8a04',
    },
    {
      label: 'Completed Looks',
      value: stats?.completedBookings ?? '12',
      icon: <CheckCircle2 size={18} />,
      badge: '100% on time',
      badgeClass: 'artist-metric-card__badge--green',
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
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
          {greetingTime()}, {user?.name?.split(' ')[0] || 'Aria'} ✨
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
              <div
                className="artist-metric-card__icon"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
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
              {stats?.responseRate ?? 100}%
            </span>
          </div>
          <div style={{ height: 8, background: '#f5efe9', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${stats?.responseRate ?? 100}%`,
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
              {stats?.completionRate ?? 100}%
            </span>
          </div>
          <div style={{ height: 8, background: '#f5efe9', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${stats?.completionRate ?? 100}%`,
                background: '#16a34a',
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="dashboard-grid">
        {/* Upcoming Bookings Panel */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">Upcoming Appointments</h2>
            <Link to="/artist-dashboard/calendar" className="artist-panel__action">
              <span>Full Schedule</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="booking-list">
            {loading ? (
              <div className="artist-empty">
                <p className="artist-empty__text">Loading schedule...</p>
              </div>
            ) : !stats?.upcomingBookings?.length ? (
              <div className="artist-empty">
                <div className="artist-empty__icon">📅</div>
                <p className="artist-empty__text">
                  No appointments scheduled for today. New bookings will appear right here.
                </p>
              </div>
            ) : (
              stats.upcomingBookings.map((booking) => (
                <div key={booking.id} className="booking-row">
                  <div className="booking-row__avatar">
                    {booking.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="booking-row__info">
                    <div className="booking-row__name">{booking.client.name}</div>
                    <div className="booking-row__service">
                      {booking.service.icon} {booking.service.name}
                    </div>
                    <div className="booking-row__date">
                      {new Date(booking.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      · {booking.time}
                    </div>
                  </div>
                  <div className="booking-row__right">
                    <span className="booking-row__amount">
                      ₹{booking.totalPaid.toLocaleString()}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Studio Setup & Quick Actions Panel */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">Studio Management</h2>
          </div>

          <div className="artist-quick-actions">
            <Link to="/artist-dashboard/profile" className="artist-quick-action">
              <div className="artist-quick-action__icon">
                <TrendingUp size={16} />
              </div>
              <span>Edit Services & Pricing</span>
            </Link>

            <Link to="/artist-dashboard/calendar" className="artist-quick-action">
              <div className="artist-quick-action__icon">
                <Calendar size={16} />
              </div>
              <span>Update Available Dates</span>
            </Link>

            <Link to="/artist-dashboard/ratings" className="artist-quick-action">
              <div className="artist-quick-action__icon">
                <UserCheck size={16} />
              </div>
              <span>Client Review Score</span>
            </Link>
          </div>

          {/* Profile Completeness Bar */}
          <div
            style={{
              padding: '18px 24px',
              borderTop: '1px solid rgba(42, 26, 31, 0.06)',
              background: '#fcfaf8',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--dark)' }}>
                Studio Profile Strength
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rose-deep)' }}>
                {profile?.bio && profile?.certification && profile?.specialties?.length
                  ? '100% Completed'
                  : '85% Good'}
              </span>
            </div>
            <div style={{ height: 6, background: '#ede6df', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width:
                    profile?.bio && profile?.certification && profile?.specialties?.length
                      ? '100%'
                      : '85%',
                  background: '#d97a8c',
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
