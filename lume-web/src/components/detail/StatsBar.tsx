import React from 'react';
import { Star, Users, Calendar, Award } from 'lucide-react';
import './StatsBar.css';

interface Stats {
  rating: number;
  reviewCount: number;
  experience: number;
  bookingCount: number;
}

interface StatsBarProps {
  stats: Stats;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="stats-grid" role="region" aria-label="Artist statistics">
      <div className="stat-card glass">
        <Star className="stat-card__icon" size={24} />
        <div className="stat-card__info">
          <div className="stat-card__value">{stats.rating.toFixed(1)}<span className="stat-card__sub">/5</span></div>
          <div className="stat-card__label">Rating</div>
        </div>
      </div>

      <div className="stat-card glass">
        <Users className="stat-card__icon" size={24} />
        <div className="stat-card__info">
          <div className="stat-card__value">{(stats.reviewCount / 100).toFixed(1)}K+</div>
          <div className="stat-card__label">Happy Clients</div>
        </div>
      </div>

      <div className="stat-card glass">
        <Calendar className="stat-card__icon" size={24} />
        <div className="stat-card__info">
          <div className="stat-card__value">{stats.bookingCount}+</div>
          <div className="stat-card__label">Bookings</div>
        </div>
      </div>

      <div className="stat-card glass">
        <Award className="stat-card__icon" size={24} />
        <div className="stat-card__info">
          <div className="stat-card__value">{stats.experience}+</div>
          <div className="stat-card__label">Years Experience</div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
