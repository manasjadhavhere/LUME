import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import './Header.css';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Artists', path: '/discover' },
  { label: 'Services', path: '/discover' },
  { label: 'Saved', path: '/saved' },
  { label: 'Profile', path: '/profile' },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isLanding = location.pathname === '/';
  const isDark = isLanding && !scrolled;

  return (
    <header className={`lume-header ${scrolled ? 'lume-header--scrolled' : ''} ${isDark ? 'lume-header--dark' : ''}`}>
      <div className="lume-header__inner">
        {/* Logo */}
        <button className="lume-header__logo" onClick={() => navigate('/')} aria-label="Lume Home">
          <Sparkles size={18} className="lume-header__logo-icon" />
          <span className="lume-header__logo-text">LUME</span>
        </button>

        {/* Desktop Nav */}
        <nav className="lume-header__nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              className={`lume-header__nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="lume-header__cta-wrap">
          <button className="lume-header__cta" onClick={() => navigate('/home')}>
            Book Now
          </button>
          {/* Hamburger */}
          <button
            className="lume-header__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`lume-header__drawer ${menuOpen ? 'lume-header__drawer--open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            className="lume-header__drawer-link"
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
        <button className="lume-header__drawer-cta" onClick={() => navigate('/home')}>
          Book Now →
        </button>
      </div>
    </header>
  );
};

export default Header;
