import { vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ArtistDetailPage from '../pages/ArtistDetailPage';

export const testArtists = [0, 1].map(index => ({
  id: `artist-${index + 1}`, slug: `artist-${index + 1}`,
  user: { id: `user-${index + 1}`, name: `Test Artist ${index + 1}`, email: 'artist@example.test' },
  location: 'Mumbai', experience: 5, isVerified: true, verificationStatus: 'VERIFIED',
  isTakingBookings: true, rating: 0, reviewCount: 0, bookingCount: 0,
  specialties: ['Bridal'], startingPrice: 2000, occasionPrice: 3000 + index * 1000,
  weddingPrice: 10000, hourlyPrice: 1500, portfolioUrls: [],
  services: [
    { id: `service-${index}-1`, name: 'Natural makeup', price: 2000 + index * 500, duration: 60, icon: '', isActive: true },
    { id: `service-${index}-2`, name: 'Bridal makeup', price: 8000 + index * 500, duration: 120, icon: '', isActive: true },
  ],
}));
export type TestArtist = typeof testArtists[number];

export const testDates = [1, 2, 3].map(offset => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
});
export const dateLabel = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

export const availabilityFixture = {
  defaultSchedule: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, timeSlots: [
    { time: '09:00', available: true }, { time: '10:00', available: true }, { time: '11:00', available: false },
  ] })),
  availability: [{ date: testDates[1], timeSlots: [{ time: '14:00', available: true }] }],
  blockedDates: [{ date: testDates[2] }],
};

export function installArtistMocks(profiles: TestArtist[] = testArtists) {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('IntersectionObserver', class {
    observe() {} unobserve() {} disconnect() {}
  });
  const fetchMock = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
    const path = new URL(String(input), 'http://localhost').pathname;
    let data: unknown;
    if (path === '/api/bookings') data = options?.method === 'POST' ? { id: 'booking-1', status: 'PENDING' } : [];
    else if (path.endsWith('/availability')) data = availabilityFixture;
    else data = profiles.find(artist => path === `/api/artists/${artist.id}`);
    return new Response(JSON.stringify({ success: !!data, data }), { status: data ? 200 : 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function mountArtist(artistId: string) {
  return render(
    <AuthContext.Provider value={{
      user: { id: 'client-1', name: 'Test Client', email: 'client@example.test', role: 'CLIENT' },
      token: 'test-token', isAuthenticated: true, isLoading: false,
      login: vi.fn(), loginWithGoogle: vi.fn(), register: vi.fn(), logout: vi.fn(), updateUser: vi.fn(), refreshUser: vi.fn(),
    }}>
      <MemoryRouter initialEntries={[`/artist/${artistId}`]}>
        <Link to="/artist/artist-2">Next artist</Link>
        <Routes><Route path="/artist/:id" element={<ArtistDetailPage />} /></Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

export async function renderArtist(artist: TestArtist = testArtists[0]) {
  const result = mountArtist(artist.id);
  await screen.findByRole('heading', { level: 1, name: artist.user.name });
  return result;
}

export const bookingPanel = () => within(screen.getByRole('complementary'));
export const reserveButton = () => bookingPanel().getByRole('button', { name: 'Reserve' });
