import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollToTop from './components/layout/ScrollToTop';

// Public & Client Pages
import LandingPage from './pages/LandingPage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import DiscoverPage from './pages/DiscoverPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './components/layout/NotFound';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Artist Dashboard Pages
import ArtistDashboardLayout from './pages/artist/ArtistDashboardLayout';
import ArtistDashboard from './pages/artist/ArtistDashboard';
import ArtistProfile from './pages/artist/ArtistProfile';
import ArtistCalendar from './pages/artist/ArtistCalendar';
import ArtistRatings from './pages/artist/ArtistRatings';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Layout components
import BottomNav from './components/layout/BottomNav';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import CustomCursor from './components/ui/CustomCursor';
import Preloader from './components/ui/Preloader';
import './App.css';

const AppLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

/**
 * AdminGuard — only allows ADMIN users. Redirects everyone else to home.
 */
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null; // Wait for auth to resolve
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
};

/**
 * ClientGuard — redirects artists to their dashboard, non-auth to /login.
 */
const ClientGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated && user?.role === 'ARTIST') return <Navigate to="/artist-dashboard" replace />;
  return <>{children}</>;
};

/**
 * ArtistGuard — only allows ARTIST users. Redirects others to login or home.
 */
const ArtistGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ARTIST') return <Navigate to="/home" replace />;
  return <>{children}</>;
};

/* Landing page has its own header/footer baked in */
const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      <Header isLanding />
      <main style={{ paddingTop: 0 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <ToastProvider>
            <div className="app">
              <Preloader />
              <CustomCursor />
              <Routes>
                {/* Auth Routes (Fullscreen) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Client & Public Routes */}
                <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />
                <Route path="/home" element={<LandingLayout><LandingPage /></LandingLayout>} />
                <Route path="/discover" element={<AppLayoutWrapper><DiscoverPage /></AppLayoutWrapper>} />
                <Route path="/reels" element={<Navigate to="/discover" replace />} />
                <Route path="/saved" element={<AppLayoutWrapper><SavedPage /></AppLayoutWrapper>} />
                <Route path="/profile" element={<AppLayoutWrapper><ClientGuard><ProfilePage /></ClientGuard></AppLayoutWrapper>} />
                <Route path="/artist/:id" element={<AppLayoutWrapper><ArtistDetailPage /></AppLayoutWrapper>} />
                <Route path="/booking/confirm" element={<AppLayoutWrapper><BookingConfirmPage /></AppLayoutWrapper>} />

                {/* Artist Portal Routes */}
                <Route path="/artist-dashboard" element={<ArtistGuard><ArtistDashboardLayout /></ArtistGuard>}>
                  <Route index element={<ArtistDashboard />} />
                  <Route path="profile" element={<ArtistProfile />} />
                  <Route path="calendar" element={<ArtistCalendar />} />
                  <Route path="ratings" element={<ArtistRatings />} />
                  <Route path="settings" element={<ArtistProfile />} />
                </Route>

                {/* Admin Portal — protected, ADMIN role required */}
                <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />

                {/* 404 */}
                <Route path="*" element={<AppLayoutWrapper><NotFound /></AppLayoutWrapper>} />
              </Routes>
            </div>
          </ToastProvider>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
