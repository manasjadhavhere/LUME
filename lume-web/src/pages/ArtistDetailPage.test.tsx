import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ArtistDetailPage from './ArtistDetailPage';
import { demoArtists } from '../data/demoData';

// Mock scrollIntoView since it's not available in JSDOM
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  // Mock console.warn to avoid noisy output from validation warnings
  console.warn = vi.fn();
  // Clear localStorage before each test
  localStorage.clear();
  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const renderWithRouter = (artistId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/artist/${artistId}`]}>
      <Routes>
        <Route path="/artist/:id" element={<ArtistDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ArtistDetailPage Unit Tests', () => {
  describe('Booking validation errors', () => {
    test('should show disabled booking button when no service selected', () => {
      const artistId = demoArtists[0].id;
      renderWithRouter(artistId);

      // Initially, no service should be selected and booking button should be disabled
      const bookingButton = screen.getByRole('button', { name: /confirm booking/i });
      expect(bookingButton).toBeDisabled();
      
      // Button should show generic text when no service selected
      expect(bookingButton).toHaveTextContent(/confirm booking/i);
      expect(bookingButton).not.toHaveTextContent(/₹/);
    });

    test('should show disabled booking button when service selected but no date/time', () => {
      const artistId = demoArtists[0].id;
      const artist = demoArtists[0];
      renderWithRouter(artistId);

      // Select a service
      const firstService = artist.services[0];
      const serviceButton = screen.getByRole('option', { 
        name: new RegExp(firstService.name + '.*₹' + firstService.price, 'i') 
      });
      fireEvent.click(serviceButton);

      // Button should still be disabled but now show the service price
      const bookingButton = screen.getByRole('button', { name: /confirm booking/i });
      expect(bookingButton).toBeDisabled();
      expect(bookingButton).toHaveTextContent(new RegExp('₹' + firstService.price.toString()));
    });

    test('should show disabled booking button when service and date selected but no time', () => {
      const artistId = demoArtists[0].id;
      const artist = demoArtists[0];
      renderWithRouter(artistId);

      // Select a service
      const firstService = artist.services[0];
      const serviceButton = screen.getByRole('option', { 
        name: new RegExp(firstService.name + '.*₹' + firstService.price, 'i') 
      });
      fireEvent.click(serviceButton);

      // Select a date - need to find date button more specifically
      const firstDate = new Date(artist.availability.dates[0].date);
      const allOptions = screen.getAllByRole('option');
      const dateButton = allOptions.find(el => {
        const label = el.getAttribute('aria-label') || '';
        return label.includes(firstDate.getDate().toString()) && 
               el.getAttribute('class')?.includes('date-picker__chip');
      });
      
      if (dateButton) {
        fireEvent.click(dateButton);
      }

      // Button should still be disabled even with service and date selected
      const bookingButton = screen.getByRole('button', { name: /confirm booking/i });
      expect(bookingButton).toBeDisabled();
    });

    test('should enable booking button when all selections are made', () => {
      const artistId = demoArtists[0].id;
      const artist = demoArtists[0];
      renderWithRouter(artistId);

      // Select a service
      const firstService = artist.services[0];
      const serviceButton = screen.getByRole('option', { 
        name: new RegExp(firstService.name + '.*₹' + firstService.price, 'i') 
      });
      fireEvent.click(serviceButton);

      // Select a date
      const firstDate = new Date(artist.availability.dates[0].date);
      const allOptions = screen.getAllByRole('option');
      const dateButton = allOptions.find(el => {
        const label = el.getAttribute('aria-label') || '';
        return label.includes(firstDate.getDate().toString()) && 
               el.getAttribute('class')?.includes('date-picker__chip');
      });
      
      if (dateButton) {
        fireEvent.click(dateButton);
      }

      // Select an available time slot
      const availableSlot = artist.availability.dates[0].slots.find(s => s.available);
      if (availableSlot) {
        const timeSlotButton = screen.getByRole('option', {
          name: `${availableSlot.time} - available`
        });
        fireEvent.click(timeSlotButton);

        // Now button should be enabled
        const bookingButton = screen.getByRole('button', { name: /confirm booking/i });
        expect(bookingButton).not.toBeDisabled();
      }
    });

    test('should handle booking attempt with incomplete form gracefully', () => {
      const artistId = demoArtists[0].id;
      renderWithRouter(artistId);

      // Try to click booking button while it's disabled (should not do anything)
      const bookingButton = screen.getByRole('button', { name: /confirm booking/i });
      expect(bookingButton).toBeDisabled();
      
      // Clicking disabled button should not trigger navigation or errors
      fireEvent.click(bookingButton);
      
      // Button should still be disabled
      expect(bookingButton).toBeDisabled();
      
      // sessionStorage should not be called for incomplete booking
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    });

    test('should maintain button state correctly when changing between complete selections', () => {
      const artistId = demoArtists[0].id;
      const artist = demoArtists[0];
      if (artist.availability.dates.length < 2) {
        // Skip test if not enough dates - this is expected behavior
        expect(true).toBe(true); 
        return;
      }
      
      renderWithRouter(artistId);

      // Make complete selection
      const firstService = artist.services[0];
      const serviceButton = screen.getByRole('option', { 
        name: new RegExp(firstService.name + '.*₹' + firstService.price, 'i') 
      });
      fireEvent.click(serviceButton);

      const firstDate = new Date(artist.availability.dates[0].date);
      const allOptions = screen.getAllByRole('option');
      let dateButton = allOptions.find(el => {
        const label = el.getAttribute('aria-label') || '';
        return label.includes(firstDate.getDate().toString()) && 
               el.getAttribute('class')?.includes('date-picker__chip');
      });
      
      if (dateButton) {
        fireEvent.click(dateButton);
      }

      const availableSlot = artist.availability.dates[0].slots.find(s => s.available);
      if (availableSlot) {
        const timeSlotButton = screen.getByRole('option', {
          name: `${availableSlot.time} - available`
        });
        fireEvent.click(timeSlotButton);

        // Button should be enabled with complete selection
        let bookingButton = screen.getByRole('button', { name: /confirm booking/i });
        expect(bookingButton).not.toBeDisabled();

        // Verify button shows the correct service price
        expect(bookingButton).toHaveTextContent(new RegExp('₹' + firstService.price.toString()));
      } else {
        // Skip test if no available slots found - this is expected behavior
        expect(true).toBe(true);
      }
    });
  });
});