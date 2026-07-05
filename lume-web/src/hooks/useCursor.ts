import { useEffect } from 'react';

export const useCursor = () => {
  useEffect(() => {
    // Only run on true pointer devices (mouse/trackpad), not touch
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'lume-cursor';
    const ring = document.createElement('div');
    ring.className = 'lume-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf: number;
    let started = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Snap dot immediately
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      if (!started) {
        // Init ring to same position on first move (prevents jump from 0,0)
        ringX = mouseX;
        ringY = mouseY;
        started = true;
      }
    };

    const animateRing = () => {
      // Lag factor — ring chases dot
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      raf = requestAnimationFrame(animateRing);
    };
    raf = requestAnimationFrame(animateRing);

    const onEnter = () => {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    };
    const onLeave = () => {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    };
    const onDown = () => dot.classList.add('cursor-click');
    const onUp = () => dot.classList.remove('cursor-click');

    // Attach hover listeners to interactive elements
    const attachHover = () => {
      document.querySelectorAll('a, button, [role="button"], [data-hover]')
        .forEach((el) => {
          el.addEventListener('mouseenter', onEnter);
          el.addEventListener('mouseleave', onLeave);
        });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    attachHover();

    // Re-attach every 1.5s to catch dynamically mounted elements
    const scanInterval = setInterval(attachHover, 1500);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(scanInterval);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      dot.remove();
      ring.remove();
    };
  }, []);
};

export default useCursor;
