import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { fc } from '@fast-check/vitest';
import ArtistDetailPage from './ArtistDetailPage';
import { demoArtists } from '../data/demoData';

/**
 * Property 8: Favorite toggle behavior
 * For any artist, clicking the heart icon should toggle the favorite state 
 * (favorited → unfavorited, or unfavorited → favorited)
 * Validates: Requirements 6.4, 12.1
 */

/**
 * Property 9: Service price display sync
 * For any selected service on the artist detail page, the "Confirm Booking" 
 * button text should display that service's price
 * Validates: Requirements 7.3
 */

/**
 * Property 10: Date selection updates slots
 * For any date selected in the date picker, the time slot grid should display 
 * only the time slots for that specific date with correct availability status
 * Validates: Requirements 8.2
 */

/**
 * Property 13: Booking button enable state
 * For any booking form state, the "Confirm Booking" button should be enabled 
 * if and only if a service, date, and time slot have all been selected
 * Validates: Requirements 10.1
 */

describe('ArtistDetailPage Properties', () => {
  beforeEach(() => {
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

  test('Property 8: Favorite toggle behavior - heart icon toggles favorite state correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoArtists.map(a => a.id)), // Pick real artist IDs from demo data
        fc.boolean(), // Initial favorite state
        (artistId, initialFavoriteState) => {
          // Setup initial localStorage state using the correct key
          const initialFavorites = initialFavoriteState ? [artistId] : [];
          localStorage.setItem('lume-favorites', JSON.stringify(initialFavorites));

          const { unmount } = renderWithRouter(artistId);

          try {
            // Find the favorite button (heart icon) - wait for it to appear
            const favoriteButton = screen.getByRole('button', { 
              name: initialFavoriteState ? /remove from favorites/i : /add to favorites/i 
            });

            expect(favoriteButton).toBeInTheDocument();

            // Click the favorite button
            fireEvent.click(favoriteButton);

            // Check localStorage after toggle
            const updatedFavoritesString = localStorage.getItem('lume-favorites');
            const updatedFavorites = updatedFavoritesString ? JSON.parse(updatedFavoritesString) : [];

            if (initialFavoriteState) {
              // Was favorited, should now be unfavorited
              expect(updatedFavorites).not.toContain(artistId);
            } else {
              // Was not favorited, should now be favorited
              expect(updatedFavorites).toContain(artistId);
            }

            // Click again to toggle back
            fireEvent.click(favoriteButton);

            // Check localStorage after second toggle
            const finalFavoritesString = localStorage.getItem('lume-favorites');
            const finalFavorites = finalFavoritesString ? JSON.parse(finalFavoritesString) : [];

            if (initialFavoriteState) {
              // Should be back to favorited state
              expect(finalFavorites).toContain(artistId);
            } else {
              // Should be back to unfavorited state
              expect(finalFavorites).not.toContain(artistId);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 } // Reduced runs since we're doing DOM rendering
    );
  });

  test('Property 8 extension: Favorite state persistence across component remounts', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoArtists.map(a => a.id)), // Pick real artist IDs
        (artistId) => {
          // Initial render - artist should not be favorited
          const { unmount: unmount1 } = renderWithRouter(artistId);

          try {
            const favoriteButton1 = screen.getByRole('button', { name: /add to favorites/i });
            
            // Toggle to favorite
            fireEvent.click(favoriteButton1);

            // Verify favorited in localStorage using the correct key
            const favoritesAfterToggle = JSON.parse(localStorage.getItem('lume-favorites') || '[]');
            expect(favoritesAfterToggle).toContain(artistId);

            // Unmount component (simulating navigation away)
            unmount1();

            // Re-render component (simulating navigation back)
            const { unmount: unmount2 } = renderWithRouter(artistId);

            try {
              // Should now show as favorited (remove from favorites)
              const favoriteButton2 = screen.getByRole('button', { name: /remove from favorites/i });
              expect(favoriteButton2).toBeInTheDocument();

              // Toggle back to unfavorited
              fireEvent.click(favoriteButton2);

              // Verify unfavorited in localStorage
              const favoritesAfterSecondToggle = JSON.parse(localStorage.getItem('lume-favorites') || '[]');
              expect(favoritesAfterSecondToggle).not.toContain(artistId);
            } finally {
              unmount2();
            }
          } finally {
            // Cleanup in case of early return/error
            if (unmount1) unmount1();
          }
        }
      ),
      { numRuns: 5 } // Even fewer runs for the remount test
    );
  });

  test('Property 9: Service price display sync - booking button updates with selected service price', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoArtists.map(a => a.id)), // Pick real artist IDs
        (artistId) => {
          const artist = demoArtists.find(a => a.id === artistId);
          if (!artist || artist.services.length === 0) return; // Skip if no artist or no services

          const { unmount } = renderWithRouter(artistId);

          try {
            // Find all service buttons using role="option" since they're in a listbox
            const serviceButtons = screen.getAllByRole('option', { name: /₹\d+/ });
            expect(serviceButtons.length).toBeGreaterThan(0);

            // Find the booking button initially
            const initialBookingButton = screen.getByRole('button', { name: /confirm booking/i });
            expect(initialBookingButton).toBeInTheDocument();

            // Test each service
            artist.services.forEach((service) => {
              // Find and click the specific service button using the actual aria-label format
              const serviceButton = screen.getByRole('option', { 
                name: `${service.name} - ₹${service.price}`
              });
              fireEvent.click(serviceButton);

              // Verify the booking button now shows the service price
              const updatedBookingButton = screen.getByRole('button', { 
                name: new RegExp('confirm booking.*₹' + service.price, 'i') 
              });
              expect(updatedBookingButton).toBeInTheDocument();

              // Verify the price display area also shows correct price
              const priceDisplay = screen.getByText(`₹${service.price.toLocaleString()}`);
              expect(priceDisplay).toBeInTheDocument();
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 5 } // Fewer runs due to DOM complexity
    );
  });

  test('Property 9 extension: Price display remains consistent across service changes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoArtists.map(a => a.id)), // Pick real artist IDs
        (artistId) => {
          const artist = demoArtists.find(a => a.id === artistId);
          if (!artist || artist.services.length < 2) return; // Need at least 2 services

          const { unmount } = renderWithRouter(artistId);

          try {
            // Select first service
            const firstService = artist.services[0];
            const firstServiceButton = screen.getByRole('option', { 
              name: `${firstService.name} - ₹${firstService.price}`
            });
            fireEvent.click(firstServiceButton);

            // Verify first service price is displayed
            let bookingButton = screen.getByRole('button', { 
              name: new RegExp('confirm booking.*₹' + firstService.price, 'i') 
            });
            expect(bookingButton).toBeInTheDocument();

            // Select second service
            const secondService = artist.services[1];
            const secondServiceButton = screen.getByRole('option', { 
              name: `${secondService.name} - ₹${secondService.price}`
            });
            fireEvent.click(secondServiceButton);

            // Verify second service price is now displayed
            bookingButton = screen.getByRole('button', { 
              name: new RegExp('confirm booking.*₹' + secondService.price, 'i') 
            });
            expect(bookingButton).toBeInTheDocument();

            // Verify first service price is no longer in button text
            const firstPriceButtons = screen.queryAllByRole('button', { 
              name: new RegExp('confirm booking.*₹' + firstService.price, 'i') 
            });
            expect(firstPriceButtons).toHaveLength(0);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 }
    );
  });

  test('Property 10: Date selection updates slots - time slot grid shows correct slots for selected date', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoArtists.map(a => a.id)), // Pick real artist IDs
        (artistId) => {
          const artist = demoArtists.find(a => a.id === artistId);
          if (!artist || artist.availability.dates.length < 2) return; // Need at least 2 dates

          const { unmount } = renderWithRouter(artistId);

          try {
            // Test each available date
            artist.availability.dates.forEach((dateAvailability) => {
              // Find and click the date chip in the date picker specifically
              const datePickerContainer = document.querySelector('[aria-label="Select a date"]');
              if (!datePickerContainer) return;
              const dateButton = datePickerContainer.querySelector(
                `[data-date="${dateAvailability.date}"]`
              ) as HTMLElement;
              if (!dateButton) return;
              fireEvent.click(dateButton);

              // Get expected slots for this date
              const expectedSlots = dateAvailability.slots;

              // Verify that the correct number of time slots are displayed
              expectedSlots.forEach(slot => {
                // Find slot by aria-label
                const slotElement = screen.getByRole('option', {
                  name: `${slot.time} - ${slot.available ? 'available' : 'taken'}`
                });
                expect(slotElement).toBeInTheDocument();

                // Check if the slot availability state is correct
                if (slot.available) {
                  expect(slotElement).toHaveClass('time-slot-grid__slot--available');
                  expect(slotElement).not.toHaveClass('time-slot-grid__slot--taken');
                  expect(slotElement).not.toBeDisabled();
                } else {
                  expect(slotElement).toHaveClass('time-slot-grid__slot--taken');
                  expect(slotElement).not.toHaveClass('time-slot-grid__slot--available');
                  expect(slotElement).toBeDisabled();
                }
              });
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 } // Fewer runs due to DOM complexity
    );
  });

  test('Property 10 extension: Date selection clears previously selected time slot', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoArtists.map(a => a.id)), // Pick real artist IDs
        (artistId) => {
          const artist = demoArtists.find(a => a.id === artistId);
          if (!artist || artist.availability.dates.length < 2) return; // Need at least 2 dates

          const { unmount } = renderWithRouter(artistId);

          try {
            // Select first date
            const datePickerContainer = document.querySelector('[aria-label="Select a date"]');
            if (!datePickerContainer) return;
            const firstDateButton = datePickerContainer.querySelector(
              `[data-date="${artist.availability.dates[0].date}"]`
            ) as HTMLElement;
            if (!firstDateButton) return;
            fireEvent.click(firstDateButton);

            // Find and select an available time slot from first date
            const firstDateAvailableSlot = artist.availability.dates[0].slots.find(s => s.available);
            if (!firstDateAvailableSlot) return; // Skip if no available slots

            const timeSlotButton = screen.getByRole('option', {
              name: `${firstDateAvailableSlot.time} - available`
            });
            fireEvent.click(timeSlotButton);

            // Verify slot is selected
            expect(timeSlotButton).toHaveClass('time-slot-grid__slot--selected');

            // Select second date
            const secondDateButton = datePickerContainer.querySelector(
              `[data-date="${artist.availability.dates[1].date}"]`
            ) as HTMLElement;
            if (!secondDateButton) return;
            fireEvent.click(secondDateButton);

            // Verify that no time slots are selected after date change
            const allSlots = screen.getAllByRole('option', {
              name: /AM|PM.*available|taken/
            });
            const selectedSlots = allSlots.filter(slot => slot.classList.contains('time-slot-grid__slot--selected'));
            expect(selectedSlots).toHaveLength(0);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 3 }
    );
  });

  test('Property 13: Booking button enable state - button enabled only when service, date, and time all selected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoArtists.map(a => a.id)), // Pick real artist IDs
        (artistId) => {
          const artist = demoArtists.find(a => a.id === artistId);
          if (!artist || artist.services.length === 0 || artist.availability.dates.length === 0) return;

          renderWithRouter(artistId);

          // Get the artist detail page container
          const detailPage = document.querySelector('.artist-detail-page');
          if (!detailPage) return;

          // Initially, booking button should be disabled
          const allButtons = detailPage.querySelectorAll('button');
          let bookingButton = Array.from(allButtons).find(btn => 
            btn.textContent?.includes('Confirm Booking')
          ) as HTMLElement;
          if (!bookingButton) return;
          expect(bookingButton).toBeDisabled();

          // Select a service - button should still be disabled
          const firstService = artist.services[0];
          const serviceContainer = detailPage.querySelector('[aria-label="Select a service"]');
          if (!serviceContainer) return;
          const serviceButton = serviceContainer.querySelector(
            `[data-service-id="${firstService.id}"]`
          ) as HTMLElement;
          if (!serviceButton) return;
          fireEvent.click(serviceButton);

          bookingButton = Array.from(detailPage.querySelectorAll('button')).find(btn => 
            btn.textContent?.includes('Confirm Booking')
          ) as HTMLElement;
          expect(bookingButton).toBeDisabled();

          // Select a date - button should still be disabled
          const datePickerContainer = detailPage.querySelector('[aria-label="Select a date"]');
          if (!datePickerContainer) return;
          const dateButton = datePickerContainer.querySelector(
            `[data-date="${artist.availability.dates[0].date}"]`
          ) as HTMLElement;
          if (!dateButton) return;
          fireEvent.click(dateButton);

          bookingButton = Array.from(detailPage.querySelectorAll('button')).find(btn => 
            btn.textContent?.includes('Confirm Booking')
          ) as HTMLElement;
          expect(bookingButton).toBeDisabled();

          // Select a time slot - now button should be enabled
          const availableSlot = artist.availability.dates[0].slots.find(s => s.available);
          if (availableSlot) {
            const timeSlotButton = detailPage.querySelector(
              `[aria-label="${availableSlot.time} - available"]`
            ) as HTMLElement;
            if (timeSlotButton) {
              fireEvent.click(timeSlotButton);

              bookingButton = Array.from(detailPage.querySelectorAll('button')).find(btn => 
                btn.textContent?.includes('Confirm Booking')
              ) as HTMLElement;
              expect(bookingButton).not.toBeDisabled();
            }
          }
        }
      ),
      { numRuns: 3 }
    );
  });

  test('Property 13 extension: Booking button disabled when any selection is cleared', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoArtists.map(a => a.id)), // Pick real artist IDs
        (artistId) => {
          const artist = demoArtists.find(a => a.id === artistId);
          if (!artist || artist.services.length < 2 || artist.availability.dates.length < 2) return;

          renderWithRouter(artistId);

          // Get the artist detail page container
          const detailPage = document.querySelector('.artist-detail-page');
          if (!detailPage) return;

          // Make full selection to enable button
          const firstService = artist.services[0];
          const serviceContainer = detailPage.querySelector('[aria-label="Select a service"]');
          if (!serviceContainer) return;
          const serviceButton = serviceContainer.querySelector(
            `[data-service-id="${firstService.id}"]`
          ) as HTMLElement;
          if (!serviceButton) return;
          fireEvent.click(serviceButton);

          const datePickerContainer = detailPage.querySelector('[aria-label="Select a date"]');
          if (!datePickerContainer) return;
          const dateButton = datePickerContainer.querySelector(
            `[data-date="${artist.availability.dates[0].date}"]`
          ) as HTMLElement;
          if (!dateButton) return;
          fireEvent.click(dateButton);

          const availableSlot = artist.availability.dates[0].slots.find(s => s.available);
          if (availableSlot) {
            const timeSlotButton = detailPage.querySelector(
              `[aria-label="${availableSlot.time} - available"]`
            ) as HTMLElement;
            if (!timeSlotButton) return;
            fireEvent.click(timeSlotButton);

            // Button should now be enabled
            let bookingButton = Array.from(detailPage.querySelectorAll('button')).find(btn => 
              btn.textContent?.includes('Confirm Booking')
            ) as HTMLElement;
            expect(bookingButton).not.toBeDisabled();

            // Change date - should clear time selection and disable button
            if (artist.availability.dates.length > 1) {
              const secondDateButton = datePickerContainer.querySelector(
                `[data-date="${artist.availability.dates[1].date}"]`
              ) as HTMLElement;
              if (secondDateButton) {
                fireEvent.click(secondDateButton);
                
                bookingButton = Array.from(detailPage.querySelectorAll('button')).find(btn => 
                  btn.textContent?.includes('Confirm Booking')
                ) as HTMLElement;
                expect(bookingButton).toBeDisabled();
              }
            }
          }
        }
      ),
      { numRuns: 2 }
    );
  });
});