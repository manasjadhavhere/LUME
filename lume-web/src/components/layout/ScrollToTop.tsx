import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that when navigating between routes,
 * the window scroll position is smoothly and immediately reset to (0, 0).
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Secondary scroll frame to catch any asynchronous layout shifts on mount
    const id = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
