const SCROLL_THRESHOLD = 8;
const EDGE_ZONE = 80;

// hides the floating dock while reading down the page and brings it back on any upward scroll or near either end
export function initDock() {
  const dock = document.querySelector('.display-controls');
  let lastScroll = window.scrollY;
  let scheduled = false;

  const update = () => {
    scheduled = false;
    const scroll = window.scrollY;
    const remaining = document.documentElement.scrollHeight - scroll - window.innerHeight;
    const delta = scroll - lastScroll;
    if (scroll < EDGE_ZONE || remaining < EDGE_ZONE) dock.classList.remove('dock-hidden');
    else if (delta > SCROLL_THRESHOLD) dock.classList.add('dock-hidden');
    else if (delta < -SCROLL_THRESHOLD) dock.classList.remove('dock-hidden');
    if (Math.abs(delta) > SCROLL_THRESHOLD) lastScroll = scroll;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
}
