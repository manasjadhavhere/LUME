import { useEffect } from 'react';

let locks = 0;

/** Nested dialogs may close in either order. Restore page scrolling after the last one closes. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    document.documentElement.classList.add('lume-scroll-locked');
    return () => {
      if (--locks === 0) document.documentElement.classList.remove('lume-scroll-locked');
    };
  }, [active]);
}
