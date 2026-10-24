export function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('[data-panel]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((other) => {
        const active = other === tab;
        other.classList.toggle('active', active);
        if (active) other.setAttribute('aria-current', 'page');
        else other.removeAttribute('aria-current');
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
      });
    });
  });
}
