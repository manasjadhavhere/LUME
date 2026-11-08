import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import {
  bookingPanel, dateLabel, installArtistMocks, mountArtist,
  renderArtist, reserveButton, testArtists, testDates,
} from '../test/artistDetailFixtures';

beforeEach(() => { localStorage.clear(); installArtistMocks(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const selectDate = (date = testDates[0]) => fireEvent.click(bookingPanel().getByRole('option', { name: dateLabel(date) }));
const selectTime = () => fireEvent.click(bookingPanel().getByRole('button', { name: '09:00 – 10:00' }));

async function chooseVenue() {
  fireEvent.click(bookingPanel().getByRole('button', { name: 'Choose address' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Deliver Service Here' }));
}

describe('artist booking', () => {
  it('requires a date and a time; services are optional with an occasion price', async () => {
    await renderArtist();
    expect(reserveButton()).toBeDisabled();
    selectDate();
    expect(reserveButton()).toBeDisabled();
    selectTime();
    expect(reserveButton()).toBeEnabled();
    fireEvent.click(reserveButton());
    expect(await screen.findByRole('dialog', { name: 'Select Booking Location' })).toBeVisible();
    expect(vi.mocked(fetch).mock.calls.some(([, opts]) => opts?.method === 'POST')).toBe(false);
  });

  it('does not submit an incomplete booking', async () => {
    await renderArtist();
    fireEvent.click(reserveButton());
    expect(vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(0);
  });

  it('clears the selected times when the date changes and honors date overrides', async () => {
    await renderArtist(); selectDate(); selectTime();
    selectDate(testDates[1]);
    expect(reserveButton()).toBeDisabled();
    expect(bookingPanel().queryByRole('button', { name: '09:00 – 10:00' })).not.toBeInTheDocument();
    expect(bookingPanel().getByRole('button', { name: '14:00 – 15:00' })).toBeVisible();
    expect(bookingPanel().getByRole('option', { name: dateLabel(testDates[2]) })).toBeDisabled();
  });

  it('submits the selected service, time and occasion and displays success', async () => {
    await renderArtist();
    fireEvent.click(bookingPanel().getByRole('button', { name: /Natural makeup/ }));
    selectDate(); selectTime(); await chooseVenue(); fireEvent.click(reserveButton());
    await screen.findByRole('dialog', { name: 'Booking requested' });
    const call = vi.mocked(fetch).mock.calls.find(([, options]) => options?.method === 'POST');
    expect(call?.[1]?.headers).toMatchObject({ Authorization: 'Bearer test-token' });
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({
      artistId: 'artist-1', serviceId: 'service-0-1', date: testDates[0], time: '09:00', priceType: 'OCCASION',
      address: 'Flat 4B, Hill Road, Mumbai - 400050', latitude: 19.05, longitude: 72.83,
    });
  });

  it('shows a failed booking and allows retry', async () => {
    const normalFetch = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, options) => options?.method === 'POST'
      ? Promise.resolve(new Response(JSON.stringify({ message: 'Slot unavailable' }), { status: 409 }))
      : normalFetch(input, options));
    await renderArtist(); selectDate(); selectTime(); await chooseVenue(); fireEvent.click(reserveButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('Slot unavailable');
    expect(reserveButton()).toBeEnabled();
    expect(screen.queryByRole('dialog', { name: 'Booking requested' })).not.toBeInTheDocument();
  });

  it('shows occupied hours to everyone and identifies the client’s own booking', async () => {
    const basicFetch = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const path = new URL(String(input), 'http://localhost').pathname;
      if (path.endsWith('/availability')) {
        const res = await basicFetch(input, init);
        const json = await res.json();
        json.data.bookedSlots = [{ date: testDates[0], start: 540, end: 600 }, { date: testDates[0], start: 600, end: 660 }];
        return Response.json(json);
      }
      if (path === '/api/bookings') return Response.json({ success: true, data: [
        { id: 'mine', artistId: 'artist-1', date: testDates[0], time: '10:00 AM', status: 'PENDING' },
      ] });
      return basicFetch(input, init);
    });
    await renderArtist();
    await screen.findByText(/Your upcoming bookings with/);
    selectDate();
    expect(bookingPanel().getByRole('button', { name: /09:00.*Booked/i })).toBeDisabled();
    expect(bookingPanel().getByRole('button', { name: /10:00.*Your booking/i })).toBeDisabled();
    expect(reserveButton()).toBeDisabled();
  });

  it('requires a fresh map pin after someone edits the coordinates', async () => {
    await renderArtist(); selectDate(); selectTime();
    fireEvent.click(bookingPanel().getByRole('button', { name: 'Choose address' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const coords = screen.getByRole('textbox', { name: 'Google Maps link or coordinates' });
    fireEvent.change(coords, { target: { value: '19.06, 72.83' } });
    fireEvent.change(coords, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Location & Map Pin' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/select a Google Maps geo-location/i);
    expect(screen.queryByRole('textbox', { name: /phone|mobile|whatsapp/i })).toBeNull();
    expect(vi.mocked(fetch).mock.calls.some(([, opts]) => opts?.method === 'POST')).toBe(false);
  });

  it('defaults to a configured price when the artist only offers weddings', async () => {
    const artist = { ...testArtists[0], occasionPrice: 0, hourlyPrice: 0 };
    installArtistMocks([artist]); await renderArtist(artist);
    expect(bookingPanel().getByRole('radio', { name: /Wedding/ })).toHaveAttribute('aria-checked', 'true');
    selectDate(); selectTime(); await chooseVenue(); fireEvent.click(reserveButton());
    await screen.findByRole('dialog', { name: 'Booking requested' });
    const call = vi.mocked(fetch).mock.calls.find(([, options]) => options?.method === 'POST');
    expect(JSON.parse(String(call?.[1]?.body)).priceType).toBe('WEDDING');
  });

  it('disables reservation when bookings are paused or no option has a price', async () => {
    for (const artist of [
      { ...testArtists[0], isTakingBookings: false },
      { ...testArtists[0], occasionPrice: 0, weddingPrice: 0, hourlyPrice: 0, services: [] },
    ]) {
      installArtistMocks([artist]); await renderArtist(artist); selectDate(); selectTime();
      expect(reserveButton()).toBeDisabled(); cleanup();
    }
  });

  it('does not let a previous artist response overwrite a newly opened profile', async () => {
    let resolveFirst!: (value: Response) => void;
    const normalFetch = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, options) => String(input).endsWith('/api/artists/artist-1')
      ? new Promise(resolve => { resolveFirst = resolve; }) : normalFetch(input, options));
    mountArtist('artist-1');
    fireEvent.click(screen.getByRole('link', { name: 'Next artist' }));
    await screen.findByRole('heading', { name: testArtists[1].user.name, level: 1 });
    await act(async () => { resolveFirst(new Response(JSON.stringify({ success: true, data: testArtists[0] }))); });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(testArtists[1].user.name);
  });

  it('shows a recoverable state when the artist request fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    mountArtist('artist-1');
    expect(await screen.findByRole('heading', { name: 'Artist not found' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Browse Artists' })).toBeVisible();
  });

  it('uses local calendar dates even when UTC is still on the previous day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 5, 0, 15));
    try {
      await renderArtist();
      expect(bookingPanel().getAllByRole('option')[0]).toHaveAccessibleName(dateLabel('2026-11-06'));
    } finally { vi.useRealTimers(); }
  });
});
