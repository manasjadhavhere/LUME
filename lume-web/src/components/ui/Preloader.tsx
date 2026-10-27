import React, { useLayoutEffect, useRef, useState } from 'react';
import './Preloader.css';

const Preloader: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(() => sessionStorage.getItem('lume_preloaded') === 'true');

  useLayoutEffect(() => {
    if (gone) return;

    const overlay = overlayRef.current;
    const brand = document.querySelector<HTMLElement>('[data-preloader-brand]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animations: Animation[] = [];
    const root = document.documentElement;

    const finish = () => {
      // Return the same link to its normal navbar layout without fading the logo.
      animations.forEach(animation => animation.cancel());
      delete root.dataset.lumeIntro;
      sessionStorage.setItem('lume_preloaded', 'true');
      setGone(true);
    };

    if (brand && !reducedMotion) {
      root.dataset.lumeIntro = 'docking';
      const target = brand.getBoundingClientRect();
      const scale = Math.min(1.8, window.innerWidth * 0.7 / target.width, window.innerHeight * 0.3 / target.height);
      const x = window.innerWidth / 2 - (target.left + target.width / 2);
      const y = window.innerHeight / 2 - (target.top + target.height / 2);
      const centered = `translate(${x}px, ${y}px) scale(${scale})`;

      // Animate the actual navbar link, so there is no duplicate logo or handoff.
      animations.push(brand.animate([
        { transform: `translate(${x}px, ${y + 8}px) scale(${scale * 0.92})`, opacity: 0, offset: 0 },
        { transform: centered, opacity: 1, offset: 0.3 },
        { transform: centered, opacity: 1, offset: 0.52, easing: 'cubic-bezier(.65, 0, .2, 1)' },
        { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 1 },
      ], { duration: 1500, fill: 'both', easing: 'ease-out' }));

      if (overlay) animations.push(overlay.animate([
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.52 },
        { opacity: 0, offset: 0.95 },
        { opacity: 0, offset: 1 },
      ], { duration: 1500, fill: 'forwards' }));
    } else if (overlay) {
      // Fullscreen routes have no navbar destination; retain the short intro.
      animations.push(overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: 1200, duration: reducedMotion ? 1 : 300, fill: 'forwards',
      }));
    }

    const goneTimer = window.setTimeout(finish, 1500);
    // If the viewport changes during the flight, settle into the new layout.
    window.addEventListener('resize', finish, { once: true });

    return () => {
      clearTimeout(goneTimer);
      window.removeEventListener('resize', finish);
      animations.forEach(animation => animation.cancel());
      delete root.dataset.lumeIntro;
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div className="preloader" ref={overlayRef} aria-hidden="true">
      <div className="preloader__brand">
        <span className="preloader__mark">
          <img className="preloader__logo" src="/logo.png" alt="" />
        </span>
        <span className="preloader__name">
          {'LUME'.split('').map((letter) => (
            <span className="preloader__letter" key={letter}>{letter}</span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default Preloader;
