import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'CLIENT' | 'ARTIST' | 'ADMIN';

export interface ArtistProfile {
  id: string;
  bio?: string;
  location: string;
  experience: number;
  certification?: string;
  badge?: string;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  totalEarnings: number;
  specialties: string[];
  startingPrice: number;
  services: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number;
  icon: string;
  description?: string;
  isActive: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  artistProfile?: ArtistProfile;
  clientProfile?: { location?: string };
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ role: UserRole }>;
  register: (data: RegisterData) => Promise<{ role: UserRole }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  location?: string;
  bio?: string;
  specialties?: string[];
  experience?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─────────────────────────────────────────────────────────────
// DEMO MODE — active when VITE_DEMO_MODE=true (no backend yet)
// Set VITE_DEMO_MODE=false once your backend is deployed.
// ─────────────────────────────────────────────────────────────
const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

const DEMO_USERS: Record<string, { password: string; user: AuthUser; token: string }> = {
  'priya@demo.com': {
    password: 'password123',
    token: 'demo-client-token',
    user: {
      id: 'demo-client-1',
      email: 'priya@demo.com',
      name: 'Priya Sharma',
      role: 'CLIENT',
      phone: '+91 98765 43210',
      clientProfile: { location: 'Mumbai' },
    },
  },
  'aria@lume.in': {
    password: 'password123',
    token: 'demo-artist-token',
    user: {
      id: 'demo-artist-1',
      email: 'aria@lume.in',
      name: 'Aria Mehra',
      role: 'ARTIST',
      artistProfile: {
        id: 'demo-artist-1',
        bio: 'Award-winning bridal & editorial makeup artist based in Mumbai.',
        location: 'Bandra, Mumbai',
        experience: 8,
        certification: 'Certified Makeup Artist',
        isVerified: true,
        isAvailable: true,
        rating: 4.9,
        reviewCount: 218,
        bookingCount: 450,
        totalEarnings: 0,
        specialties: ['Bridal', 'Editorial', 'Glam'],
        startingPrice: 2499,
        services: [],
      },
    },
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('lume_token');
    const storedUser = localStorage.getItem('lume_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Silently refresh user data
        fetchMe(storedToken).catch(() => {
          // Token expired — clear session
          clearSession();
        });
      } catch {
        clearSession();
      }
    }

    setIsLoading(false);
  }, []);

  const fetchMe = async (authToken: string) => {
    // Skip network check in demo mode — token is always valid
    if (IS_DEMO) return;

    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!res.ok) throw new Error('Session expired');

    const data = await res.json();
    const freshUser = data.data;
    setUser(freshUser);
    localStorage.setItem('lume_user', JSON.stringify(freshUser));
  };

  const saveSession = (authToken: string, authUser: AuthUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('lume_token', authToken);
    localStorage.setItem('lume_user', JSON.stringify(authUser));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lume_token');
    localStorage.removeItem('lume_user');
  };

  const login = async (email: string, password: string): Promise<{ role: UserRole }> => {
    // ── Demo mode (no backend) ──────────────────────────────
    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 600)); // fake latency
      const demo = DEMO_USERS[email.toLowerCase()];
      if (!demo || demo.password !== password) {
        throw new Error('Invalid credentials. Try: priya@demo.com / aria@lume.in with password123');
      }
      saveSession(demo.token, demo.user);
      return { role: demo.user.role };
    }
    // ── Real API ────────────────────────────────────────────
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    saveSession(data.data.token, data.data.user);
    return { role: data.data.user.role };
  };

  const register = async (registerData: RegisterData): Promise<{ role: UserRole }> => {
    // ── Demo mode (no backend) ──────────────────────────────
    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 800));
      const demoUser: AuthUser = {
        id: `demo-${Date.now()}`,
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
        phone: registerData.phone,
        ...(registerData.role === 'CLIENT'
          ? { clientProfile: { location: registerData.location } }
          : {
              artistProfile: {
                id: `demo-${Date.now()}`,
                bio: registerData.bio,
                location: registerData.location || 'Mumbai',
                experience: registerData.experience || 0,
                isVerified: false,
                isAvailable: true,
                rating: 0,
                reviewCount: 0,
                bookingCount: 0,
                totalEarnings: 0,
                specialties: registerData.specialties || [],
                startingPrice: 0,
                services: [],
              },
            }),
      };
      saveSession(`demo-token-${Date.now()}`, demoUser);
      return { role: demoUser.role };
    }
    // ── Real API ────────────────────────────────────────────
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    saveSession(data.data.token, data.data.user);
    return { role: data.data.user.role };
  };

  const logout = () => {
    clearSession();
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('lume_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
