import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor: React.FC = () => {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inner = innerRef.current;
    const outer = outerRef.current;
    const trail = trailRef.current;
    if (!inner || !outer) return;

    let mouseX = -100, mouseY = -100;
    let outerX = mouseX, outerY = mouseY;
    let trailX = mouseX, trailY = mouseY;
    let rafId: number;
    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        inner.style.opacity = '1';
        outer.style.opacity = '1';
        if (trail) trail.style.opacity = '0.45';
      }
      inner.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
    };

    // Smooth lerp loop for outer ring + trail
    const loop = () => {
      // Outer ring: medium lag
      outerX += (mouseX - outerX) * 0.14;
      outerY += (mouseY - outerY) * 0.14;
      outer.style.transform = `translate3d(${outerX - 21}px, ${outerY - 21}px, 0)`;

      // Trail: slower lag
      if (trail) {
        trailX += (mouseX - trailX) * 0.06;
        trailY += (mouseY - trailY) * 0.06;
        trail.style.transform = `translate3d(${trailX - 3}px, ${trailY - 3}px, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // Expand / hover states
    const onEnter = () => {
      outer.classList.add('cursor-outer--expand');
      inner.classList.add('cursor-inner--hover');
    };
    const onLeave = () => {
      outer.classList.remove('cursor-outer--expand');
      inner.classList.remove('cursor-inner--hover');
    };
    const onDown = () => {
      inner.classList.add('cursor-inner--click');
      outer.classList.add('cursor-outer--click');
    };
    const onUp = () => {
      inner.classList.remove('cursor-inner--click');
      outer.classList.remove('cursor-outer--click');
    };

    const attachListeners = () => {
      const interactives = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, label, [tabindex]'
      );
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
      return interactives;
    };

    let interactives = attachListeners();
    const observer = new MutationObserver(() => {
      interactives = attachListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={trailRef} className="cursor-trail" aria-hidden="true" style={{ opacity: 0 }} />
      <div ref={outerRef} className="cursor-outer" aria-hidden="true" style={{ opacity: 0 }} />
      <div ref={innerRef} className="cursor-inner" aria-hidden="true" style={{ opacity: 0 }} />
    </>
  );
};

export default CustomCursor;
