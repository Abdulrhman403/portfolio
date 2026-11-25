/**
 * theme.js — Dark / Light mode toggle
 */
(function () {
  const STORAGE_KEY = 'portfolio-theme';

  function getPreferred() {
    return localStorage.getItem(STORAGE_KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Apply on load
  applyTheme(getPreferred());

  // Expose globally
  window.toggleTheme = toggleTheme;
})();
