import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';
import HeroBanner from './HeroBanner';
import CategoryChips from './CategoryChips';
import ArtistCard from './ArtistCard';
import { demoArtists } from '../../data/demoData';
import type { ServiceCategory } from '../../data/types';

describe('Home Components', () => {
  describe('SearchBar', () => {
    it('renders search input and filter button', () => {
      const mockOnChange = vi.fn();
      const mockOnFilter = vi.fn();
      
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
          onFilter={mockOnFilter}
        />
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open filters/i })).toBeInTheDocument();
    });

    it('calls onChange when typing in search input', async () => {
      const mockOnChange = vi.fn();
      const mockOnFilter = vi.fn();
      
      render(
        <SearchBar
          value=""
          onChange={mockOnChange}
          onFilter={mockOnFilter}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Should debounce, so we need to wait
      await new Promise(resolve => setTimeout(resolve, 350));
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });
  });

  describe('HeroBanner', () => {
    it('renders promo, title, and CTA button', () => {
      const mockOnCtaClick = vi.fn();
      
      render(
        <HeroBanner
          promo="Limited Slots"
          title="Book Your Artist Today"
          ctaText="Explore"
          onCtaClick={mockOnCtaClick}
        />
      );
      
      expect(screen.getByText('Limited Slots')).toBeInTheDocument();
      expect(screen.getByText('Book Your Artist Today')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Explore' })).toBeInTheDocument();
    });

    it('calls onCtaClick when button is clicked', () => {
      const mockOnCtaClick = vi.fn();
      
      render(
        <HeroBanner
          promo="Limited Slots"
          title="Book Your Artist Today"
          ctaText="Explore"
          onCtaClick={mockOnCtaClick}
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'Explore' }));
      expect(mockOnCtaClick).toHaveBeenCalled();
    });
  });

  describe('CategoryChips', () => {
    const categories = [
      { id: 'All' as ServiceCategory, icon: '✨', label: 'All' },
      { id: 'Bridal' as ServiceCategory, icon: '👰', label: 'Bridal' },
      { id: 'Natural' as ServiceCategory, icon: '🌿', label: 'Natural' }
    ];

    it('renders all category chips', () => {
      const mockOnCategorySelect = vi.fn();
      
      render(
        <CategoryChips
          categories={categories}
          activeCategory="All"
          onCategorySelect={mockOnCategorySelect}
        />
      );
      
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Bridal')).toBeInTheDocument();
      expect(screen.getByText('Natural')).toBeInTheDocument();
    });

    it('calls onCategorySelect when chip is clicked', () => {
      const mockOnCategorySelect = vi.fn();
      
      render(
        <CategoryChips
          categories={categories}
          activeCategory="All"
          onCategorySelect={mockOnCategorySelect}
        />
      );
      
      fireEvent.click(screen.getByText('Bridal'));
      expect(mockOnCategorySelect).toHaveBeenCalledWith('Bridal');
    });
  });

  describe('ArtistCard', () => {
    const mockArtist = demoArtists[0]; // Use first demo artist

    it('renders artist information correctly', () => {
      const mockOnClick = vi.fn();
      
      render(
        <ArtistCard
          artist={mockArtist}
          onClick={mockOnClick}
        />
      );
      
      expect(screen.getByText(mockArtist.name)).toBeInTheDocument();
      expect(screen.getByText(mockArtist.specialties.join(' · '))).toBeInTheDocument();
      expect(screen.getByText(mockArtist.rating.toString())).toBeInTheDocument();
      expect(screen.getByText(`₹${mockArtist.startingPrice.toLocaleString()}`)).toBeInTheDocument();
    });

    it('calls onClick when card is clicked', () => {
      const mockOnClick = vi.fn();
      
      render(
        <ArtistCard
          artist={mockArtist}
          onClick={mockOnClick}
        />
      );
      
      fireEvent.click(screen.getByRole('button'));
      expect(mockOnClick).toHaveBeenCalledWith(mockArtist.id);
    });

    it('renders badge when artist has one', () => {
      const artistWithBadge = { ...mockArtist, badge: 'Top Pick' as const };
      const mockOnClick = vi.fn();
      
      render(
        <ArtistCard
          artist={artistWithBadge}
          onClick={mockOnClick}
        />
      );
      
      expect(screen.getByText('Top Pick')).toBeInTheDocument();
    });
  });
});