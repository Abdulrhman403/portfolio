document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;
  const STORAGE_KEY = 'portfolio-theme';

  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
      );
    }
  };

  // Load saved theme or detect OS preference
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(STORAGE_KEY, nextTheme);
    });
  }
});