import type { Review } from '../data/types';

/**
 * Sort reviews by date (most recent first)
 */
export const sortReviewsByDate = (reviews: Review[]): Review[] => {
  return [...reviews].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Most recent first
  });
};

/**
 * Sort reviews by rating (highest first)
 */
export const sortReviewsByRating = (reviews: Review[]): Review[] => {
  return [...reviews].sort((a, b) => b.rating - a.rating);
};
