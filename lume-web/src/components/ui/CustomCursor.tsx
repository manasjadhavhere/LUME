import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './CustomCursor.css';

/**
 * Global coordinates tracker preserved across re-renders and route transitions
 */
let lastKnownX = -100;
let lastKnownY = -100;
let hasEverMoved = false;

const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Internal physics and visibility state
  const stateRef = useRef({
    mouseX: lastKnownX,
    mouseY: lastKnownY,
    ringX: lastKnownX,
    ringY: lastKnownY,
    isVisible: false,
    isFinePointer: false,
  });

  // Evaluate interactive state of element under pointer
  const evaluateTarget = (target: Element | null) => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    if (!target) {
      dot.classList.remove('cursor-dot--hover', 'cursor-dot--input');
      ring.classList.remove('cursor-ring--hover', 'cursor-ring--input');
      return;
    }

    const isInput = !!target.closest(
      'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'
    );

    let isInteractive = false;
    if (isInput) {
      isInteractive = true;
    } else {
      const interactiveEl = target.closest(
        'a, button, [role="button"], select, summary, label, input[type="button"], input[type="submit"], .home-carousel-arrow, .home-about__thumb, .home-artist, .home-step-card, [data-hover], [tabindex]:not([tabindex="-1"])'
      );
      if (interactiveEl) {
        isInteractive = true;
      } else {
        // Fallback for custom components using cursor: pointer in css
        try {
          const comp = window.getComputedStyle(target);
          if (comp.cursor === 'pointer') {
            isInteractive = true;
          }
        } catch {
          // ignore error if element disconnected
        }
      }
    }

    if (isInput) {
      dot.classList.add('cursor-dot--input');
      ring.classList.add('cursor-ring--input');
      dot.classList.remove('cursor-dot--hover');
      ring.classList.remove('cursor-ring--hover');
    } else if (isInteractive) {
      dot.classList.add('cursor-dot--hover');
      ring.classList.add('cursor-ring--hover');
      dot.classList.remove('cursor-dot--input');
      ring.classList.remove('cursor-ring--input');
    } else {
      dot.classList.remove('cursor-dot--hover', 'cursor-dot--input');
      ring.classList.remove('cursor-ring--hover', 'cursor-ring--input');
    }
  };

  // Route change handler: clears stuck states and guarantees cursor visibility on the new page
  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // 1. Immediately purge any click, hover, or input classes from previous page
    dot.classList.remove('cursor-dot--hover', 'cursor-dot--click', 'cursor-dot--input');
    ring.classList.remove('cursor-ring--hover', 'cursor-ring--click', 'cursor-ring--input');

    // 2. If the user previously moved inside the window, keep the cursor visible
    if (hasEverMoved && lastKnownX >= 0 && lastKnownY >= 0) {
      stateRef.current.isVisible = true;
      stateRef.current.mouseX = lastKnownX;
      stateRef.current.mouseY = lastKnownY;
      dot.classList.add('cursor-visible');
      ring.classList.add('cursor-visible');

      dot.style.transform = `translate3d(${lastKnownX}px, ${lastKnownY}px, 0) translate(-50%, -50%)`;

      // 3. Re-evaluate the element under current pointer position on the newly rendered page
      requestAnimationFrame(() => {
        const el = document.elementFromPoint(lastKnownX, lastKnownY);
        evaluateTarget(el);
      });
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    // Only activate on pointer devices (mouse/trackpad), not touch screens
    const checkFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!checkFinePointer()) return;

    stateRef.current.isFinePointer = true;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let rafId: number;
    const state = stateRef.current;

    const makeVisible = (x: number, y: number) => {
      hasEverMoved = true;
      lastKnownX = x;
      lastKnownY = y;
      state.mouseX = x;
      state.mouseY = y;

      if (!state.isVisible) {
        state.isVisible = true;
        state.ringX = x;
        state.ringY = y;
        dot.classList.add('cursor-visible');
        ring.classList.add('cursor-visible');
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      makeVisible(e.clientX, e.clientY);

      // Dot tracks cursor position with zero latency
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;

      // Update interactive target
      evaluateTarget(e.target as Element);
    };

    // Smooth physics loop for the trailing ring
    const render = () => {
      if (state.isVisible) {
        // Fluid glide interpolation factor without dragging or lag
        state.ringX += (state.mouseX - state.ringX) * 0.18;
        state.ringY += (state.mouseY - state.ringY) * 0.18;
        ring.style.transform = `translate3d(${state.ringX}px, ${state.ringY}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    const onMouseOver = (e: MouseEvent) => {
      evaluateTarget(e.target as Element);
    };

    const onMouseOut = (e: MouseEvent) => {
      // If leaving an interactive element to nothing or another window, re-check
      if (!e.relatedTarget) {
        evaluateTarget(null);
      }
    };

    const onMouseDown = () => {
      dot.classList.add('cursor-dot--click');
      ring.classList.add('cursor-ring--click');
    };

    const onMouseUp = () => {
      dot.classList.remove('cursor-dot--click');
      ring.classList.remove('cursor-ring--click');
    };

    const onClick = () => {
      // Safety reset in case mouseup was swallowed during a route navigation
      dot.classList.remove('cursor-dot--click');
      ring.classList.remove('cursor-ring--click');
    };

    // Window wheel / scroll: ensures cursor remains visible and adapts hover state
    const onScrollOrWheel = () => {
      if (hasEverMoved && lastKnownX >= 0 && lastKnownY >= 0) {
        if (!state.isVisible) {
          state.isVisible = true;
          dot.classList.add('cursor-visible');
          ring.classList.add('cursor-visible');
        }
        const el = document.elementFromPoint(lastKnownX, lastKnownY);
        evaluateTarget(el);
      }
    };

    // CRITICAL: Only hide cursor when the mouse GENUINELY exits the window viewport.
    // Detached elements or page unmounts dispatch synthetic mouseleave events on document
    // which previously made the cursor vanish on every route navigation.
    const onWindowLeave = (e: MouseEvent) => {
      const isActuallyOutside =
        !e.relatedTarget &&
        (e.clientY <= 0 ||
          e.clientX <= 0 ||
          e.clientX >= window.innerWidth ||
          e.clientY >= window.innerHeight);

      if (isActuallyOutside) {
        state.isVisible = false;
        dot.classList.remove('cursor-visible', 'cursor-dot--hover', 'cursor-dot--click', 'cursor-dot--input');
        ring.classList.remove('cursor-ring--visible', 'cursor-ring--hover', 'cursor-ring--click', 'cursor-ring--input');
      }
    };

    const onWindowEnter = (e: MouseEvent) => {
      if (e.clientX > 0 && e.clientY > 0) {
        makeVisible(e.clientX, e.clientY);
        dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        evaluateTarget(e.target as Element);
      }
    };

    const onWindowFocus = () => {
      if (hasEverMoved && lastKnownX >= 0 && lastKnownY >= 0) {
        makeVisible(lastKnownX, lastKnownY);
      }
    };

    const onWindowBlur = () => {
      // Remove temporary click states on blur
      dot.classList.remove('cursor-dot--click');
      ring.classList.remove('cursor-ring--click');
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mouseout', onMouseOut, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('click', onClick);
    window.addEventListener('wheel', onScrollOrWheel, { passive: true });
    window.addEventListener('scroll', onScrollOrWheel, { passive: true });
    document.addEventListener('mouseleave', onWindowLeave);
    document.addEventListener('mouseenter', onWindowEnter);
    window.addEventListener('focus', onWindowFocus);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('click', onClick);
      window.removeEventListener('wheel', onScrollOrWheel);
      window.removeEventListener('scroll', onScrollOrWheel);
      document.removeEventListener('mouseleave', onWindowLeave);
      document.removeEventListener('mouseenter', onWindowEnter);
      window.removeEventListener('focus', onWindowFocus);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
};

export default CustomCursor;
