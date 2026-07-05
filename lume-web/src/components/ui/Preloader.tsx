import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import './Preloader.css';

const Preloader: React.FC = () => {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Start fade at 1.8s
    const fadeTimer = setTimeout(() => setFading(true), 1800);
    // Remove from DOM at 2.5s (after fade transition)
    const goneTimer = setTimeout(() => setGone(true), 2600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`preloader ${fading ? 'preloader--fade' : ''}`} aria-hidden="true">
      <div className="preloader__backdrop" />
      <div className="preloader__content">
        <div className="preloader__logo-wrap">
          <Sparkles className="preloader__logo-icon" size={40} />
        </div>
        <span className="preloader__brand">LUME</span>
        <div className="preloader__spinner">
          <div className="preloader__spinner-ring" />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
