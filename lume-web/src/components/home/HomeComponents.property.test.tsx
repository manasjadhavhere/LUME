import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import ArtistCard from './ArtistCard';
import { demoArtists } from '../../data/demoData';
import type { Review, Service } from '../../data/types';

describe('Home Components - Data Completeness Properties', () => {
  /**
   * Property 5: Component data completeness
   * Artist card components should render all required fields
   */
  test('ArtistCard displays all required data fields from demo artists', () => {
    // Test using real demo artists to ensure all required fields are present
    demoArtists.forEach((artist) => {
      const mockOnClick = () => {};
      const { container, unmount } = render(
        <ArtistCard artist={artist} onClick={mockOnClick} />
      );

      // Check for artist name in the card
      const nameElement = container.querySelector('.artist-card__name');
      expect(nameElement?.textContent).toContain(artist.name);

      // Check for specialties
      const specialtiesElement = container.querySelector('.artist-card__specialties');
      expect(specialtiesElement?.textContent).toContain(artist.specialties.join(' · '));

      // Check for rating
      const ratingElement = container.querySelector('.artist-card__rating-value');
      expect(ratingElement?.textContent).toContain(artist.rating.toString());

      // Check for review count in stats
      const statsSection = container.querySelector('.artist-card__stats');
      expect(statsSection?.textContent).toContain(artist.reviewCount.toString());

      // Check for distance
      const distanceElement = container.querySelector('.artist-card__distance');
      expect(distanceElement?.textContent).toContain(artist.distance.toString());

      // Check for price
      const priceElement = container.querySelector('.artist-card__price-value');
      const formattedPrice = artist.startingPrice.toLocaleString();
      expect(priceElement?.textContent).toContain(formattedPrice);

      // Verify the card element exists
      const cardElement = container.querySelector('.artist-card');
      expect(cardElement).toBeTruthy();

      // Artist card should have a clickable button element
      const clickableElement = container.querySelector('[role="button"]');
      expect(clickableElement).toBeTruthy();

      unmount();
    });
  });

  /**
   * Property 6: Badge conditional rendering
   * For any artist with a badge property set to "Top Pick" or "New", 
   * the artist card should display that badge; for any artist without a badge, 
   * no badge should display
   * Validates: Requirements 5.2
   */
  test('Badge conditional rendering - badges display only when present', () => {
    // Partition demo artists by badge presence
    const artistsWithBadges = demoArtists.filter((a) => a.badge);
    const artistsWithoutBadges = demoArtists.filter((a) => !a.badge);

    // Test artists WITH badges
    artistsWithBadges.forEach((artist) => {
      const mockOnClick = () => {};
      const { container, unmount } = render(
        <ArtistCard artist={artist} onClick={mockOnClick} />
      );

      // Badge container should exist
      const badgeElement = container.querySelector('.artist-card__badge');
      expect(badgeElement).toBeTruthy();

      // Badge text should be present
      const badgeText = container.querySelector('.badge-text');
      expect(badgeText?.textContent).toBe(artist.badge);

      unmount();
    });

    // Test artists WITHOUT badges
    artistsWithoutBadges.forEach((artist) => {
      const mockOnClick = () => {};
      const { container, unmount } = render(
        <ArtistCard artist={artist} onClick={mockOnClick} />
      );

      // No badge element should exist if artist doesn't have a badge
      const badgeElement = container.querySelector('.artist-card__badge');
      expect(badgeElement).toBeFalsy();

      unmount();
    });
  });

  /**
   * Property: All demo artists have complete data
   * Validates that the demo data set has all required fields for rendering
   */
  test('Demo artists have all required fields for rendering components', () => {
    // For each demo artist, verify all required fields exist
    demoArtists.forEach((artist) => {
      // Required fields for artist card rendering
      expect(artist.id).toBeDefined();
      expect(artist.name).toBeDefined();
      expect(artist.avatar).toBeDefined();
      expect(artist.specialties).toBeDefined();
      expect(Array.isArray(artist.specialties)).toBe(true);
      expect(artist.specialties.length).toBeGreaterThan(0);

      // Rating and review fields
      expect(artist.rating).toBeDefined();
      expect(typeof artist.rating).toBe('number');
      expect(artist.rating).toBeGreaterThanOrEqual(0);
      expect(artist.rating).toBeLessThanOrEqual(5);

      expect(artist.reviewCount).toBeDefined();
      expect(typeof artist.reviewCount).toBe('number');
      expect(artist.reviewCount).toBeGreaterThanOrEqual(0);

      // Distance and price
      expect(artist.distance).toBeDefined();
      expect(typeof artist.distance).toBe('number');
      expect(artist.distance).toBeGreaterThan(0);

      expect(artist.startingPrice).toBeDefined();
      expect(typeof artist.startingPrice).toBe('number');
      expect(artist.startingPrice).toBeGreaterThan(0);

      // Services array
      expect(artist.services).toBeDefined();
      expect(Array.isArray(artist.services)).toBe(true);
      expect(artist.services.length).toBeGreaterThan(0);

      // Each service should have required fields
      artist.services.forEach((service: Service) => {
        expect(service.id).toBeDefined();
        expect(service.name).toBeDefined();
        expect(service.icon).toBeDefined();
        expect(service.price).toBeDefined();
        expect(typeof service.price).toBe('number');
        expect(service.price).toBeGreaterThan(0);
      });

      // Availability
      expect(artist.availability).toBeDefined();
      expect(artist.availability.dates).toBeDefined();
      expect(Array.isArray(artist.availability.dates)).toBe(true);

      // Reviews array
      expect(artist.reviews).toBeDefined();
      expect(Array.isArray(artist.reviews)).toBe(true);
      expect(artist.reviews.length).toBeGreaterThanOrEqual(3);

      // Each review should have required fields
      artist.reviews.forEach((review: Review) => {
        expect(review.id).toBeDefined();
        expect(review.userName).toBeDefined();
        expect(review.avatar).toBeDefined();
        expect(review.rating).toBeDefined();
        expect(typeof review.rating).toBe('number');
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
        expect(review.text).toBeDefined();
        expect(typeof review.text).toBe('string');
      });
    });
  });
});
