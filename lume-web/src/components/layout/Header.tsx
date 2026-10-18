import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Heart, MapPin, Menu, Search, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Artists', path: '/discover' },
  { label: 'Categories', path: '/categories' },
  { label: 'About', path: '/about' },
  { label: 'How it works', path: '/#how-it-works' },
];

const POPULAR_OCCASIONS = ['Bridal', 'Editorial', 'Glamour', 'Natural', 'Party', 'Festive', 'Fantasy', 'SFX'];
const POPULAR_CITIES = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];

export default function Header({ isLanding = false }: { isLanding?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchOccasion, setSearchOccasion] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const menuButton = useRef<HTMLButtonElement>(null);
  const menuOpen = openPath === location.pathname;
  const accountPath = user?.role === 'ARTIST' ? '/artist-dashboard' : user?.role === 'ADMIN' ? '/admin' : '/profile';

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return (location.pathname === '/' || location.pathname === '/home') && !location.hash;
    }
    if (path.startsWith('/#')) {
      return (location.pathname === '/' || location.pathname === '/home') && location.hash === path.slice(1);
    }
    return location.pathname === path;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpenPath(null); menuButton.current?.focus(); }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSearchOpen(false);
      };
      document.addEventListener('keydown', onEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onEscape);
      };
    }
  }, [searchOpen]);

  const followLink = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    setOpenPath(null);
    if (path === '/' && (location.pathname === '/' || location.pathname === '/home')) {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    } else if (path.startsWith('/#') && (location.pathname === '/' || location.pathname === '/home')) {
      const section = document.getElementById(path.slice(2));
      if (section) {
        event.preventDefault();
        section.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    } else if (path === '/profile' && user?.role === 'ARTIST') {
      event.preventDefault();
      navigate(accountPath);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    const params = new URLSearchParams({
      category: searchOccasion || 'All',
      location: searchCity.trim(),
      service: '',
    });
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <header className={`lume-header ${isLanding ? 'lume-header--landing' : ''} ${scrolled ? 'lume-header--scrolled' : ''} ${menuOpen ? 'lume-header--open' : ''}`}>
      <div className="lume-header__inner">
        <Link to="/" className="lume-brand" aria-label="Lume home" onClick={() => setOpenPath(null)}><span className="lume-brand__mark"><img src="/logo.png" alt="Lume logo" /></span><span className="lume-brand__name">LUME</span></Link>
        <nav className="lume-header__nav" aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              to={link.path}
              className={`lume-header__nav-link ${isLinkActive(link.path) ? 'is-active' : ''}`}
              aria-current={isLinkActive(link.path) ? 'page' : undefined}
              onClick={event => followLink(event, link.path)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="lume-header__actions">
          <button
            type="button"
            className="lume-header__search-toggle"
            aria-label="Search artists"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={19} strokeWidth={2.2} />
          </button>
          <Link className="lume-header__saved" to="/saved" aria-label="Saved artists"><Heart size={21} strokeWidth={2} /></Link>
          <Link className="lume-header__account" to={isAuthenticated ? accountPath : '/login'}>{isAuthenticated ? 'My account' : 'Sign in'}</Link>
          <button className="lume-header__toggle" ref={menuButton} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setOpenPath(menuOpen ? null : location.pathname)}>{menuOpen ? <X size={26} /> : <Menu size={26} />}</button>
        </div>
      </div>
      {menuOpen && (
        <>
          <button className="lume-header__backdrop" aria-label="Close navigation" tabIndex={-1} onClick={() => setOpenPath(null)} />
          <nav id="mobile-navigation" className="lume-header__drawer" aria-label="Mobile navigation">
            <span className="lume-header__menu-label">A LITTLE BEAUTY, A LITTLE YOU</span>
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.label}
                to={link.path}
                className={isLinkActive(link.path) ? 'is-active' : ''}
                aria-current={isLinkActive(link.path) ? 'page' : undefined}
                onClick={event => followLink(event, link.path)}
              >
                <span>0{index + 1}</span>
                {link.label}
                <ArrowUpRight size={18} />
              </Link>
            ))}
            <div className="lume-header__drawer-bottom">
              <Link to="/saved" onClick={() => setOpenPath(null)}>
                <Heart size={16} /> Saved artists
              </Link>
              <Link to={isAuthenticated ? accountPath : '/login'} onClick={() => setOpenPath(null)}>
                {isAuthenticated ? 'My account' : 'Sign in'} <ArrowRightIcon />
              </Link>
            </div>
            <Link
              to={user?.role === 'ARTIST' ? '/artist-dashboard' : '/discover'}
              className="lume-header__drawer-cta"
              onClick={() => setOpenPath(null)}
            >
              {user?.role === 'ARTIST' ? 'Open artist portal' : 'Discover your artist'}
              <ArrowUpRight size={18} />
            </Link>
          </nav>
        </>
      )}

      {/* Mobile Search Modal Popup with Blurred Backdrop */}
      {searchOpen && (
        <div className="lume-search-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div
            className="lume-search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search makeup artists"
            onClick={e => e.stopPropagation()}
          >
            <div className="lume-search-modal__header">
              <div>
                <span className="lume-search-modal__kicker">LET’S FIND YOUR MATCH</span>
                <h3>Find Your Artist</h3>
              </div>
              <button
                type="button"
                className="lume-search-modal__close"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={19} strokeWidth={2.4} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="lume-search-modal__form">
              <div className="lume-search-modal__field-group">
                <span className="lume-search-modal__label">
                  <Sparkles size={14} /> SELECT OCCASION
                </span>
                <div className="lume-search-modal__chips">
                  {POPULAR_OCCASIONS.map(occ => {
                    const isSelected = searchOccasion === occ;
                    return (
                      <button
                        key={occ}
                        type="button"
                        className={`lume-search-modal__chip ${isSelected ? 'is-active' : ''}`}
                        onClick={() => setSearchOccasion(isSelected ? '' : occ)}
                      >
                        {occ}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lume-search-modal__field-group">
                <span className="lume-search-modal__label">
                  <MapPin size={14} /> YOUR LOCATION
                </span>
                <div className="lume-search-modal__input-wrap">
                  <MapPin size={17} />
                  <input
                    type="text"
                    placeholder="Where shall we meet?"
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="lume-search-modal__chips lume-search-modal__chips--cities">
                  {POPULAR_CITIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`lume-search-modal__chip lume-search-modal__chip--city ${searchCity === c ? 'is-active' : ''}`}
                      onClick={() => setSearchCity(searchCity === c ? '' : c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="lume-search-modal__submit">
                <span>Find my artist</span>
                <ArrowRight size={17} />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

function ArrowRightIcon() { return <ArrowUpRight size={16} />; }
