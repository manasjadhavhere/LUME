import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
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
        {/* Logo Container with Glassmorphism */}
        <div className="logo-container glass" role="img" aria-label="Lume sparkles logo">
          <Sparkles className="logo-icon" size={64} aria-hidden="true" />
        </div>

        {/* Brand Title */}
        <h1 className="brand-title">LUME</h1>
        
        {/* Subtitle */}
        <p className="brand-subtitle">Beauty · Art · Glow</p>
        
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
