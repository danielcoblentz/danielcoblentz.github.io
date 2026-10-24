const FADE_DISTANCE = 72;

// keeps the edge fade mask aligned with the visible part of the page as it scrolls
export function initScrollFade() {
  const container = document.querySelector('.container');
  let scheduled = false;

  const update = () => {
    scheduled = false;
    const top = window.scrollY;
    const viewport = window.innerHeight;
    const remaining = document.documentElement.scrollHeight - top - viewport;
    container.style.setProperty('--viewport-top', `${top}px`);
    container.style.setProperty('--viewport-bottom', `${top + viewport}px`);
    container.style.setProperty('--fade-top-alpha', String(1 - Math.min(top / FADE_DISTANCE, 1)));
    container.style.setProperty('--fade-bottom-alpha', String(1 - Math.min(Math.max(remaining, 0) / FADE_DISTANCE, 1)));
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(container);
  update();
}
