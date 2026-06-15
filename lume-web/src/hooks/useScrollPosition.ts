import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to persist and restore scroll position when navigating between pages
 * Specifically saves home page scroll position and restores it when returning
 */
const useScrollPosition = (isHomePage: boolean = false) => {
  const location = useLocation();
  const isRestoringRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isHomePage) {
      // Restore scroll position when returning to home page
      const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
      
      if (savedScrollPosition && !isRestoringRef.current) {
        isRestoringRef.current = true;
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
          // Reset flag after restoration
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
        });
      }
      
      // Save scroll position when navigating away from home
      const handleScroll = () => {
        if (!isRestoringRef.current) {
          sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
        }
      };

      // Save scroll position before page unloads or navigation
      const handleBeforeUnload = () => {
        if (!isRestoringRef.current) {
          sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
        }
      };

      // Add scroll listener with throttling for performance
      const throttledHandleScroll = () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(handleScroll, 100);
      };

      window.addEventListener('scroll', throttledHandleScroll, { passive: true });
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('scroll', throttledHandleScroll);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [isHomePage, location.pathname]);

  // Function to manually clear stored scroll position
  const clearScrollPosition = () => {
    sessionStorage.removeItem('homeScrollPosition');
  };

  return { clearScrollPosition };
};

export default useScrollPosition;