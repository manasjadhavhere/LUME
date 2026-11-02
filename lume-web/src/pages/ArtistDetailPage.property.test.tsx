import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { fc } from '@fast-check/vitest';
import { bookingPanel, dateLabel, installArtistMocks, renderArtist, reserveButton, testArtists, testDates } from '../test/artistDetailFixtures';

beforeEach(() => { localStorage.clear(); installArtistMocks(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('artist booking properties', () => {
  it('toggles and persists favorites for every artist and initial state', async () => {
    await fc.assert(fc.asyncProperty(fc.constantFrom(...testArtists), fc.boolean(), async (artist, initiallySaved) => {
      localStorage.setItem('lume-favorites', JSON.stringify(initiallySaved ? [artist.id] : []));
      const view = await renderArtist(artist);
      try {
        const toggle = screen.getByRole('button', { name: initiallySaved ? 'Remove from saved' : 'Save artist' });
        fireEvent.click(toggle);
        expect(JSON.parse(localStorage.getItem('lume-favorites') || '[]').includes(artist.id)).toBe(!initiallySaved);
        fireEvent.click(toggle);
        expect(JSON.parse(localStorage.getItem('lume-favorites') || '[]').includes(artist.id)).toBe(initiallySaved);
      } finally { view.unmount(); }
    }), { numRuns: 8 });
  });

  it('preserves saved artists across remounts', async () => {
    await fc.assert(fc.asyncProperty(fc.constantFrom(...testArtists), async artist => {
      localStorage.clear();
      const first = await renderArtist(artist);
      fireEvent.click(screen.getByRole('button', { name: 'Save artist' })); first.unmount();
      const second = await renderArtist(artist);
      try { expect(screen.getByRole('button', { name: 'Remove from saved' })).toHaveAttribute('aria-pressed', 'true'); }
      finally { second.unmount(); }
    }), { numRuns: 4 });
  });

  it('shows each selected service price and restores the occasion price on deselection', async () => {
    await fc.assert(fc.asyncProperty(fc.constantFrom(...testArtists), fc.integer({ min: 0, max: 1 }), async (artist, index) => {
      const view = await renderArtist(artist);
      try {
        const service = artist.services[index];
        const button = bookingPanel().getByRole('button', { name: new RegExp(service.name) });
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-pressed', 'true');
        expect(bookingPanel().getAllByText(`₹${service.price.toLocaleString('en-IN')}`).length).toBeGreaterThan(1);
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-pressed', 'false');
        expect(bookingPanel().getAllByText(`₹${artist.occasionPrice.toLocaleString('en-IN')}`).length).toBeGreaterThan(1);
      } finally { view.unmount(); }
    }), { numRuns: 6 });
  });

  it('requires a selected time and clears it on date changes for every artist', async () => {
    await fc.assert(fc.asyncProperty(fc.constantFrom(...testArtists), async artist => {
      const view = await renderArtist(artist);
      try {
        expect(reserveButton()).toBeDisabled();
        fireEvent.click(bookingPanel().getByRole('option', { name: dateLabel(testDates[0]) }));
        expect(reserveButton()).toBeDisabled();
        const slot = bookingPanel().getByRole('button', { name: '09:00 – 10:00' });
        fireEvent.click(slot); expect(reserveButton()).toBeEnabled();
        fireEvent.click(slot); expect(reserveButton()).toBeDisabled();
        fireEvent.click(slot);
        fireEvent.click(bookingPanel().getByRole('option', { name: dateLabel(testDates[1]) }));
        expect(reserveButton()).toBeDisabled();
        expect(bookingPanel().queryByRole('button', { name: '09:00 – 10:00' })).not.toBeInTheDocument();
        fireEvent.click(bookingPanel().getByRole('button', { name: '14:00 – 15:00' }));
        expect(reserveButton()).toBeEnabled();
      } finally { view.unmount(); }
    }), { numRuns: 4 });
  });
});
