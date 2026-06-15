import { sortReviewsByDate, sortReviewsByRating } from './reviewSorting';
import type { Review } from '../data/types';

describe('Review Sorting Utilities', () => {
  const mockReviews: Review[] = [
    {
      id: '1',
      userName: 'Alice',
      avatar: '👩',
      rating: 4,
      text: 'Great work!',
      date: new Date('2026-06-01')
    },
    {
      id: '2',
      userName: 'Bob',
      avatar: '👨',
      rating: 5,
      text: 'Excellent!',
      date: new Date('2026-06-05')
    },
    {
      id: '3',
      userName: 'Charlie',
      avatar: '👨‍🦱',
      rating: 3,
      text: 'Good',
      date: new Date('2026-06-03')
    }
  ];

  describe('sortReviewsByDate', () => {
    test('should sort reviews by date with most recent first', () => {
      const sorted = sortReviewsByDate(mockReviews);

      expect(sorted[0].date).toEqual(new Date('2026-06-05'));
      expect(sorted[1].date).toEqual(new Date('2026-06-03'));
      expect(sorted[2].date).toEqual(new Date('2026-06-01'));
    });

    test('should not mutate original array', () => {
      const original = [...mockReviews];
      sortReviewsByDate(mockReviews);

      expect(mockReviews).toEqual(original);
    });
  });

  describe('sortReviewsByRating', () => {
    test('should sort reviews by rating with highest first', () => {
      const sorted = sortReviewsByRating(mockReviews);

      expect(sorted[0].rating).toBe(5);
      expect(sorted[1].rating).toBe(4);
      expect(sorted[2].rating).toBe(3);
    });

    test('should not mutate original array', () => {
      const original = [...mockReviews];
      sortReviewsByRating(mockReviews);

      expect(mockReviews).toEqual(original);
    });

    test('should handle reviews with same rating', () => {
      const reviewsWithSameRating: Review[] = [
        { id: '1', userName: 'A', avatar: '👩', rating: 5, text: 'X', date: new Date('2026-06-01') },
        { id: '2', userName: 'B', avatar: '👨', rating: 5, text: 'Y', date: new Date('2026-06-02') },
        { id: '3', userName: 'C', avatar: '👨‍🦱', rating: 4, text: 'Z', date: new Date('2026-06-03') }
      ];

      const sorted = sortReviewsByRating(reviewsWithSameRating);

      expect(sorted[0].rating).toBe(5);
      expect(sorted[1].rating).toBe(5);
      expect(sorted[2].rating).toBe(4);
    });
  });
});
