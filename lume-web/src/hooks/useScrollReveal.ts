import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Premium scroll-reveal hook.
 * - Observes all .reveal* elements with IntersectionObserver
 * - Auto-assigns per-element stagger delays based on sibling index
 *   when the parent has class .stagger
 * - Supports reduced-motion preference
 */
export const useScrollReveal = (deps: React.DependencyList = []) => {
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const timer = setTimeout(() => {
      const SELECTOR = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade, .reveal-blur';

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;

              // Auto-stagger: if the element doesn't already have a delay set
              // and is inside a .stagger parent, calculate its index
              if (!el.style.transitionDelay && el.parentElement?.classList.contains('stagger')) {
                const siblings = Array.from(el.parentElement.children);
                const idx = siblings.indexOf(el);
                el.style.transitionDelay = `${(idx * 0.08).toFixed(2)}s`;
              }

              el.classList.add('visible');

              // Unobserve after triggering (one-shot reveal)
              observer.unobserve(el);
            }
          });
        },
        {
          threshold: prefersReducedMotion ? 0 : 0.08,
          rootMargin: '0px 0px -48px 0px',
        }
      );

      document.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 60);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, ...deps]);
};

export default useScrollReveal;
