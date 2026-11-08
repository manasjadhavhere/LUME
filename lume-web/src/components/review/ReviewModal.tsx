import { useScrollLock } from '../../hooks/useScrollLock';
import React, { useEffect, useState } from 'react';
import { Star, X, Sparkles } from 'lucide-react';
import { API_BASE, useAuth } from '../../context/AuthContext';
import './ReviewModal.css';

export interface ReviewModalProps {
  isOpen: boolean;
  bookingId: string;
  artistName: string;
  serviceName?: string;
  bookingDateLabel?: string;
  onClose: () => void;
  onSuccess: (review: { id: string; rating: number; text: string; createdAt: string }) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs improvement',
  2: 'Below expectations',
  3: 'Good experience',
  4: 'Great artistry & service',
  5: 'Truly exceptional!',
};

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  bookingId,
  artistName,
  serviceName,
  bookingDateLabel,
  onClose,
  onSuccess,
}) => {
  useScrollLock(isOpen);
  const { token } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  const activeStars = hoveredRating ?? rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      setError('Please write at least 10 characters sharing your experience.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const authToken = token || localStorage.getItem('lume_token');
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          bookingId,
          rating,
          text: trimmed,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || 'Could not submit your review. Please try again.');
      }

      if (!body.data?.id) throw new Error('Could not confirm the published review.');
      onSuccess(body.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="lume-review-modal__backdrop"
      data-lenis-prevent
      onClick={() => !submitting && onClose()}
    >
      <div
        className="lume-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lume-review-modal-title"
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="lume-review-modal__close"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close review modal"
        >
          <X size={18} />
        </button>

          <form onSubmit={handleSubmit}>
            <div className="lume-review-modal__header">
              <span className="lume-review-modal__eyebrow">
                <Sparkles size={13} /> VERIFIED SESSION REVIEW
              </span>
              <h2 id="lume-review-modal-title">Rate your session with {artistName}</h2>
              {(serviceName || bookingDateLabel) && (
                <p className="lume-review-modal__meta">
                  {[serviceName, bookingDateLabel].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>

            <div className="lume-review-modal__stars-box">
              <div
                className="lume-review-modal__stars"
                role="radiogroup"
                aria-label="Star rating"
                onMouseLeave={() => setHoveredRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    className={`lume-review-modal__star-btn ${star <= activeStars ? 'is-filled' : ''}`}
                    onMouseEnter={() => setHoveredRating(star)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={30}
                      fill={star <= activeStars ? '#D97A8C' : 'transparent'}
                      color={star <= activeStars ? '#D97A8C' : '#D5C7CC'}
                    />
                  </button>
                ))}
              </div>
              <span className="lume-review-modal__rating-label">
                {RATING_LABELS[activeStars]}
              </span>
            </div>

            <div className="lume-review-modal__field">
              <label htmlFor="lume-review-textarea">Share your experience</label>
              <textarea
                id="lume-review-textarea"
                rows={4}
                placeholder={`How was ${artistName}'s artistry, punctuality, hygiene, and overall experience?`}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError('');
                }}
                maxLength={1000}
                required
              />
              <div className="lume-review-modal__char-hint">
                <span>Minimum 10 characters</span>
                <span>{text.trim().length}/1000</span>
              </div>
            </div>

            {error && (
              <div className="lume-review-modal__error" role="alert">
                {error}
              </div>
            )}

            <div className="lume-review-modal__actions">
              <button
                type="button"
                className="lume-review-modal__cancel"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="lume-review-modal__submit"
                disabled={submitting || text.trim().length < 10}
              >
                {submitting ? 'Publishing Review…' : 'Publish Review'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default ReviewModal;

