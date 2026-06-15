import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import ArtistDetailPage from './pages/ArtistDetailPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import DiscoverPage from './pages/DiscoverPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './components/layout/NotFound';
import BottomNav from './components/layout/BottomNav';

import Footer from './components/layout/Footer';
import Header from './components/layout/Header';

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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/home" element={<AppLayoutWrapper><HomePage /></AppLayoutWrapper>} />
              <Route path="/discover" element={<AppLayoutWrapper><DiscoverPage /></AppLayoutWrapper>} />
              <Route path="/saved" element={<AppLayoutWrapper><SavedPage /></AppLayoutWrapper>} />
              <Route path="/profile" element={<AppLayoutWrapper><ProfilePage /></AppLayoutWrapper>} />
              <Route path="/artist/:id" element={<AppLayoutWrapper><ArtistDetailPage /></AppLayoutWrapper>} />
              <Route path="/booking/confirm" element={<AppLayoutWrapper><BookingConfirmPage /></AppLayoutWrapper>} />
              <Route path="*" element={<AppLayoutWrapper><NotFound /></AppLayoutWrapper>} />
            </Routes>
          </div>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
