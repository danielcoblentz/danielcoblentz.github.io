const root = document.documentElement;

function storedTheme() {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch {}
}

export function initTheme() {
  const themeButton = document.querySelector('.theme-button');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');

  const syncControls = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    themeButton.setAttribute('aria-label', `Switch to ${next} theme`);
    themeColorMeta.content = getComputedStyle(root).getPropertyValue('--background').trim();
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    syncControls();
    window.dispatchEvent(new Event('themechange'));
  };

  themeButton.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    storeTheme(theme);
    applyTheme(theme);
  });

  prefersDark.addEventListener('change', (event) => {
    if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light');
  });

  syncControls();
}
