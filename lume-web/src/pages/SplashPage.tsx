import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import './SplashPage.css';

const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-navigate after 5 seconds
    const timer = setTimeout(() => {
      navigate('/home');
    }, 5000);

    // Cleanup timer if component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleExploreClick = () => {
    navigate('/home');
  };

  return (
    <div className="splash-page">
      {/* Animated Floating Orbs */}
      <div className="orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="splash-content">
        {/* Logo Container */}
        <div className="logo-container" role="img" aria-label="Lume logo" style={{ background: 'transparent', boxShadow: 'none', border: 'none', marginBottom: '1rem' }}>
          <img src="/logo.png" alt="Lume Logo" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Subtitle */}
        <p className="brand-subtitle" style={{ marginTop: '0.5rem' }}>Beauty · Art · Glow</p>

        {/* Tagline */}
        <p className="brand-tagline">Your canvas. Our masterpiece.</p>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleExploreClick}
          ariaLabel="Explore artists - navigate to home screen"
          className="explore-btn"
        >
          Explore Artists →
        </Button>

        {/* Pagination Dots */}
        <div className="pagination-dots" role="img" aria-label="Page 1 of 3">
          <span className="dot active" aria-hidden="true"></span>
          <span className="dot" aria-hidden="true"></span>
          <span className="dot" aria-hidden="true"></span>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
