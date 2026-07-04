import { useEffect } from 'react';

export const useCursor = () => {
  useEffect(() => {
    // Don't run on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'lume-cursor';
    const ring = document.createElement('div');
    ring.className = 'lume-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      raf = requestAnimationFrame(animateRing);
    };
    raf = requestAnimationFrame(animateRing);

    const onEnter = () => { dot.classList.add('hover'); ring.classList.add('hover'); };
    const onLeave = () => { dot.classList.remove('hover'); ring.classList.remove('hover'); };
    const onDown = () => dot.classList.add('click');
    const onUp = () => dot.classList.remove('click');

    const addListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, select, textarea, [data-cursor]')
        .forEach(el => {
          el.addEventListener('mouseenter', onEnter);
          el.addEventListener('mouseleave', onLeave);
        });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    addListeners();

    // Re-scan for new elements periodically
    const interval = setInterval(addListeners, 2000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      dot.remove();
      ring.remove();
    };
  }, []);
};

export default useCursor;
