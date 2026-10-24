export function initTimeline() {
  document.querySelectorAll('.timeline-header').forEach((header) => {
    const item = header.closest('.timeline-item');
    const details = item.querySelector('.timeline-details');

    const toggle = () => {
      const expanded = header.getAttribute('aria-expanded') !== 'true';
      header.setAttribute('aria-expanded', String(expanded));
      item.classList.toggle('expanded', expanded);
      details.hidden = !expanded;
    };

    header.addEventListener('click', (event) => {
      if (!event.target.closest('a')) toggle();
    });

    header.addEventListener('keydown', (event) => {
      if (event.target === header && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        toggle();
      }
    });
  });
}
