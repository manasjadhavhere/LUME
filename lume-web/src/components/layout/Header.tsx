import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Search } from 'lucide-react';
import './Header.css';

const NAV_LINKS = [
  { label: 'Artists',    path: '/#artists' },
  { label: 'About',      path: '/#about' },
  { label: 'Categories', path: '/#categories' },
  { label: 'Partner',    path: '/#partner' },
  { label: 'Contact',    path: '/#contact' },
];

const APP_NAV = [
  { label: 'Home',     path: '/home' },
  { label: 'Discover', path: '/discover' },
  { label: 'Saved',    path: '/saved' },
  { label: 'Profile',  path: '/profile' },
];

interface HeaderProps {
  isLanding?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isLanding = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isDark = isLanding && !scrolled;

  const handleHashLink = (path: string) => {
    if (path.startsWith('/#')) {
      const id = path.slice(2);
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      }
    } else {
      navigate(path);
    }
    setMenuOpen(false);
  };

  const links = isLanding ? NAV_LINKS : APP_NAV;

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
          {links.map((link) => (
            <button
              key={link.label}
              className={`lume-header__nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => handleHashLink(link.path)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="lume-header__cta-wrap">
          <button className="lume-header__search" aria-label="Search artists" onClick={() => navigate('/discover')}>
            <Search size={18} />
          </button>
          <button className="lume-header__cta" onClick={() => navigate('/home')}>
            Book Now ↗
          </button>
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
      <div className={`lume-header__drawer ${menuOpen ? 'lume-header__drawer--open' : ''}`} aria-hidden={!menuOpen}>
        {links.map((link) => (
          <button
            key={link.label}
            className="lume-header__drawer-link"
            onClick={() => handleHashLink(link.path)}
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
