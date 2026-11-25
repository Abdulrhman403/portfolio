/**
 * i18n.js — Internationalization (multi-language support)
 */
(function () {
  const STORAGE_KEY = 'portfolio-lang';
  let translations = {};

  async function loadLang(lang) {
    const res = await fetch('data/lang.json');
    const data = await res.json();
    translations = data[lang] || data['en'] || {};
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    applyTranslations();
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) el.textContent = translations[key];
    });
  }

  function getDefaultLang() {
    return localStorage.getItem(STORAGE_KEY) ||
      navigator.language.slice(0, 2) || 'en';
  }

  // Init
  loadLang(getDefaultLang());

  // Expose globally
  window.setLang = loadLang;
})();
