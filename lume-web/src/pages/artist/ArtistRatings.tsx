import React, { useEffect } from 'react';
import {
  Star,
  Award,
  CheckCircle2,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import './ArtistPages.css';

interface ReviewItem {
  id: string;
  rating: number;
  text: string;
  reply?: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface RatingsData {
  reviews: ReviewItem[];
  distribution: Record<number, number>;
}

const ArtistRatings: React.FC = () => {
  const { user } = useAuth();
  const { data, execute } = useApi<RatingsData>();

  useEffect(() => {
    if (user?.artistProfile?.id) {
      execute(`/api/reviews/artist/${user.artistProfile.id}`);
    }
  }, [user]);

  const profile = user?.artistProfile;
  const reviews = data?.reviews || [
    {
      id: 'rev-1',
      rating: 5,
      text: 'Aria did my bridal makeup for my wedding in Bandra and she was absolutely phenomenonal! Long lasting and looked stunning in photos.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      client: { id: 'c-1', name: 'Rhea Kapoor' },
    },
    {
      id: 'rev-2',
      rating: 5,
      text: 'Super professional, punctual, and very attentive to skincare prep before glam. Highly recommended!',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      client: { id: 'c-2', name: 'Simran Mehta' },
    },
  ];

  const distribution = data?.distribution || { 5: 110, 4: 14, 3: 2, 2: 1, 1: 0 };
  const totalReviews = Object.values(distribution).reduce((a, b) => a + b, 0) || 127;

  return (
    <div className="artist-page">
      <div className="artist-page__header">
        <h1 className="artist-page__title">Rating & Performance Analytics</h1>
        <p className="artist-page__subtitle">
          See how your clients rate your artistry, understand what impacts your search ranking, and respond to client reviews.
        </p>
      </div>

      {/* Score Overview Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
        <div className="artist-stat-card" style={{ '--gradient': 'linear-gradient(90deg, var(--gold), var(--gold-light))', '--icon-bg': 'rgba(201,149,106,0.15)', '--icon-color': 'var(--gold)' } as React.CSSProperties}>
          <div className="artist-stat-card__icon"><Star size={18} /></div>
          <div className="artist-stat-card__label">Overall Rating</div>
          <div className="artist-stat-card__value">{profile?.rating ? profile.rating.toFixed(1) : '4.9'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>Based on {profile?.reviewCount || totalReviews} reviews</span>
        </div>

        <div className="artist-stat-card" style={{ '--gradient': 'linear-gradient(90deg, #16a34a, #4ade80)', '--icon-bg': 'rgba(34,197,94,0.12)', '--icon-color': '#16a34a' } as React.CSSProperties}>
          <div className="artist-stat-card__icon"><CheckCircle2 size={18} /></div>
          <div className="artist-stat-card__label">Booking Completion Rate</div>
          <div className="artist-stat-card__value">100%</div>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Top tier reliability</span>
        </div>

        <div className="artist-stat-card" style={{ '--gradient': 'linear-gradient(90deg, var(--rose-deep), var(--rose))', '--icon-bg': 'var(--rose-light)', '--icon-color': 'var(--rose-deep)' } as React.CSSProperties}>
          <div className="artist-stat-card__icon"><Award size={18} /></div>
          <div className="artist-stat-card__label">Search Algorithm Boost</div>
          <div className="artist-stat-card__value">Active</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--rose-deep)', fontWeight: 600 }}>Featured in 'Top Picks'</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Rating Breakdown & Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="artist-panel">
            <div className="artist-panel__header">
              <h2 className="artist-panel__title">Rating Distribution</h2>
            </div>
            <div className="artist-panel__body">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars] || 0;
                const percentage = Math.round((count / totalReviews) * 100) || 0;

                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ width: 44, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {stars} <Star size={13} fill="var(--gold)" color="var(--gold)" />
                    </span>
                    <div style={{ flex: 1, height: 10, background: 'rgba(42,26,31,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: stars >= 4 ? 'linear-gradient(90deg, var(--gold), #d4a373)' : 'var(--rose-deep)',
                          borderRadius: 99,
                        }}
                      />
                    </div>
                    <span style={{ width: 40, textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="artist-panel">
            <div className="artist-panel__header">
              <h2 className="artist-panel__title">Recent Client Reviews</h2>
            </div>
            <div className="artist-panel__body">
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid rgba(42,26,31,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)' }}>
                      {r.client.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={13} fill="var(--gold)" color="var(--gold)" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.5 }}>
                    "{r.text}"
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 4, display: 'block' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What Affects Your Score & Tips */}
        <div className="artist-panel" style={{ alignSelf: 'start' }}>
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">What Affects Your Score?</h2>
          </div>
          <div className="artist-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>Response Time (&lt; 2 hours)</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 2 }}>
                  Artists who accept or respond to booking requests quickly get a +15% boost in client visibility.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--rose-light)', color: 'var(--rose-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Heart size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>Complete Portfolio & Menu</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 2 }}>
                  Profiles with at least 4 photos and clearly priced services convert 3x more profile views to bookings.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(234,179,8,0.12)', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>Cancellations</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 2 }}>
                  Last-minute artist cancellations temporarily reduce search placement for 14 days.
                </p>
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(201,149,106,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(201,149,106,0.2)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                💡 Pro Tip
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--dark)', marginTop: 4 }}>
                Ask your clients to leave a review after their wedding or event! Verified booking reviews carry 2x weight on Lume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistRatings;
