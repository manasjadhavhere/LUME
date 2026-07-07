import React from 'react';
import { Star, User } from 'lucide-react';
import type { Review } from '../../data/types';
import './ReviewCard.css';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="review-card stagger-item">
      <div className="review-card__header">
        <div className="review-card__avatar">
          {review.avatar && (review.avatar.startsWith('http') || review.avatar.startsWith('/')) ? (
            <img src={review.avatar} alt={review.userName} className="review-card__image" />
          ) : (
            <User size={22} className="review-card__user-icon" />
          )}
        </div>
        
        <div className="review-card__info">
          <h4 className="review-card__name">{review.userName}</h4>
          <p className="review-card__date">{formatDate(review.date)}</p>
        </div>
      </div>
      
      <div className="review-card__rating">
        {Array.from({ length: Math.floor(review.rating) }).map((_, i) => (
          <Star
            key={`full-${i}`}
            size={14}
            className="review-card__star review-card__star--filled"
          />
        ))}
        {review.rating % 1 !== 0 && (
          <Star
            key="half"
            size={14}
            className="review-card__star review-card__star--half"
          />
        )}
        {Array.from({ length: 5 - Math.ceil(review.rating) }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={14}
            className="review-card__star review-card__star--empty"
          />
        ))}
        <span className="review-card__rating-value">({review.rating})</span>
      </div>
      
      <p className="review-card__text">{review.text}</p>
    </div>
  );
};

export default ReviewCard;
