import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'client-1',
      name: 'Aria Sharma',
      email: 'aria@example.com',
      phone: '+91 98765 43210',
      role: 'client',
      location: 'South Mumbai',
      bio: 'Fashion and bridal enthusiast',
      avatarUrl: '',
    },
    token: 'fake-jwt-token',
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
  API_BASE: 'http://localhost:3001',
}));

// Mock useFavorites
vi.mock('../hooks/useFavorites', () => ({
  default: () => ({
    getFavorites: () => ['artist-1', 'artist-2'],
    toggleFavorite: vi.fn(),
    isFavorite: (id: string) => ['artist-1', 'artist-2'].includes(id),
  }),
}));

vi.mock('../components/ui/GeoLocationInput', () => ({
  default: () => <input data-testid="mock-geo-input" />,
}));

vi.mock('../components/payment/PaymentOptionsModal', () => ({
  default: () => null,
}));

describe('ProfilePage (My Account Overhaul)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })
    );
  });

  const renderProfile = () =>
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

  it('renders client identity and executive telemetry badges', () => {
    renderProfile();

    expect(screen.getByText('Aria Sharma')).toBeInTheDocument();
    expect(screen.getByText(/South Mumbai/i)).toBeInTheDocument();
    expect(screen.getByText('Verified Client')).toBeInTheDocument();
    expect(screen.getByText('Saved Artists')).toBeInTheDocument();
    expect(screen.getByText('Saved Addresses')).toBeInTheDocument();
  });

  it('renders all 6 navigation tabs', () => {
    renderProfile();

    expect(screen.getByRole('button', { name: /My Bookings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Saved Artists/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Addresses & Venues/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beauty Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Account Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Concierge & Help/i })).toBeInTheDocument();
  });

  it('switches to Addresses & Venues tab and displays address management features', () => {
    renderProfile();

    const addressTabBtn = screen.getByRole('button', { name: /Addresses & Venues/i });
    fireEvent.click(addressTabBtn);

    expect(screen.getByText('Saved Booking Venues & Addresses')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add New Address/i })).toBeInTheDocument();
  });

  it('switches to Beauty Profile tab and renders preference toggles', () => {
    renderProfile();

    const beautyTabBtn = screen.getByRole('button', { name: /Beauty Profile/i });
    fireEvent.click(beautyTabBtn);

    expect(screen.getByText('Personalized Glam & Beauty Profile')).toBeInTheDocument();
    expect(screen.getByText('Preferred Makeup Aesthetics')).toBeInTheDocument();
    expect(screen.getByText('Bridal / Royal Traditional')).toBeInTheDocument();
    expect(screen.getByText('Skin Type')).toBeInTheDocument();
    expect(screen.getByText('Complexion Undertone')).toBeInTheDocument();
  });

  it('switches to Concierge & Help tab and shows VIP support guarantees', () => {
    renderProfile();

    const helpTabBtn = screen.getByRole('button', { name: /Concierge & Help/i });
    fireEvent.click(helpTabBtn);

    expect(screen.getByText('Client Concierge & VIP Support')).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp VIP Concierge/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Escrow Protection/i)).toBeInTheDocument();
  });
});
