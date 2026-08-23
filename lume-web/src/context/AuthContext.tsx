import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'CLIENT' | 'ARTIST' | 'ADMIN';

export interface ArtistProfile {
  id: string;
  bio?: string;
  gender?: string;
  dob?: string;
  location: string;
  experience: number;
  certification?: string;
  certificationFiles?: string[];
  profileImageUrl?: string;
  badge?: string;
  isVerified: boolean;
  verificationStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EDIT_REQUESTED' | 'EDIT_APPROVED';
  isAvailable: boolean;
  isTakingBookings?: boolean;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  totalEarnings: number;
  specialties: string[];
  startingPrice: number;
  weddingPrice?: number;
  occasionPrice?: number;
  hourlyPrice?: number;
  portfolioUrls?: string[];
  instagramUrl?: string;
  services: ServiceItem[];
  verificationRemarks?: string;
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

export interface ClientProfile {
  id?: string;
  location?: string;
  mobileNumber?: string;
  dob?: string;
  bio?: string;
  aadharNumber?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  gender?: string;
  dob?: string;
  avatarUrl?: string;
  artistProfile?: ArtistProfile;
  clientProfile?: ClientProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ role: UserRole }>;
  register: (data: RegisterData) => Promise<{ role: UserRole }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser> | AuthUser) => void;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  gender?: string;
  dob?: string;
  mobileNumber?: string;
  location?: string;
  bio?: string;
  specialties?: string[];
  experience?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('lume_token');
    const storedUser = localStorage.getItem('lume_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        fetchMe(storedToken).catch(() => clearSession());
      } catch {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const fetchMe = async (authToken: string) => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error('Session expired');
    const data = await res.json();
    const freshUser = data.data;
    setUser(freshUser);
    localStorage.setItem('lume_user', JSON.stringify(freshUser));
  };

  const refreshUser = async () => {
    if (token) await fetchMe(token);
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
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    saveSession(data.data.token, data.data.user);
    return { role: data.data.user.role };
  };

  const register = async (registerData: RegisterData): Promise<{ role: UserRole }> => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    saveSession(data.data.token, data.data.user);
    return { role: data.data.user.role };
  };

  const logout = () => clearSession();

  const updateUser = (updates: Partial<AuthUser> | AuthUser) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('lume_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user, token, isLoading,
        isAuthenticated: !!user && !!token,
        login, register, logout, updateUser, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
