import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader: React.FC = () => {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('lume_preloaded')) {
      setGone(true);
      return;
    }
    sessionStorage.setItem('lume_preloaded', 'true');
    const fadeTimer = setTimeout(() => setFading(true), 900);
    const goneTimer = setTimeout(() => setGone(true), 1300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`preloader ${fading ? 'preloader--fade' : ''}`} aria-hidden="true">
      {/* Rich Warm Blush Rose Backdrop & Ethereal Glowing Orbs */}
      <div className="preloader__backdrop">
        <div className="preloader__glow-orb" />
        <div className="preloader__ambient-glow preloader__ambient-glow--1" />
        <div className="preloader__ambient-glow preloader__ambient-glow--2" />
        
        {/* Floating Sparkles in Background */}
        <div className="preloader__floating-sparkles">
          {/* Top-Right Cross Sparkle */}
          <svg 
            className="preloader__sparkle-float preloader__sparkle-float--tr" 
            viewBox="0 0 40 40" 
            fill="none"
          >
            <path d="M 20 6 L 20 34 M 6 20 L 34 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>

          {/* Bottom-Right Diamond Sparkle */}
          <svg 
            className="preloader__sparkle-float preloader__sparkle-float--br" 
            viewBox="0 0 40 40" 
            fill="none"
          >
            <path d="M 20 4 C 20 15, 15 20, 4 20 C 15 20, 20 25, 20 36 C 20 25, 25 20, 36 20 C 25 20, 20 15, 20 4 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>

          {/* Top-Left Subtle Dot */}
          <span className="preloader__sparkle-float preloader__sparkle-float--tl-dot" />
        </div>
      </div>

      {/* Main Architectural Showcase (Star Emblem + LUME + Institutional Subtitle) */}
      <div className="preloader__content">
        <div className="preloader__showcase">
          {/* Metallic Shine Beam that sweeps across the logo */}
          <div className="preloader__shimmer-sweep" />

          {/* Horizontal Brand Row */}
          <div className="preloader__brand-row">
            {/* Left: Refined 4-Pointed Star Emblem with Plus & Circle Dot */}
            <div className="preloader__emblem-wrapper">
              <svg 
                className="preloader__star-svg" 
                viewBox="0 0 120 120" 
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Main 4-Pointed Star Outline */}
                <path 
                  className="preloader__path-star"
                  d="M 55 18 C 55 42, 33 60, 15 60 C 33 60, 55 78, 55 102 C 55 78, 77 60, 95 60 C 77 60, 55 42, 55 18 Z" 
                  stroke="currentColor" 
                  strokeWidth="2.6" 
                  strokeLinejoin="round" 
                />
                
                {/* Small Plus Sparkle (Top-Right of Star) */}
                <path 
                  className="preloader__path-plus"
                  d="M 80 24 L 96 24 M 88 16 L 88 32" 
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                />
                
                {/* Solid Circle Dot (Bottom-Left of Star) */}
                <circle 
                  className="preloader__path-dot"
                  cx="24" 
                  cy="94" 
                  r="5" 
                  fill="currentColor" 
                />
              </svg>
            </div>

            {/* Right: LUME Serif Typography */}
            <h1 className="preloader__brand-title">LUME</h1>
          </div>

          {/* Institutional Brand Subtitle */}
          <div className="preloader__subtitle-row">
            <span className="preloader__subtitle-line" />
            <span className="preloader__subtitle-text">INDIA'S PREMIER BEAUTY PLATFORM</span>
            <span className="preloader__subtitle-line" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
