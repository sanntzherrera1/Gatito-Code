import { STRINGS } from '../config/i18n-strings.js';
import { ico } from '../config/icons.js';
import * as Settings from './Settings.js';

const listeners = new Set();

export function t(key, params = {}) {
  const lang = Settings.getLanguage();
  let str = STRINGS[lang]?.[key] ?? STRINGS['es']?.[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, name) => {
    if (name.startsWith('ico_')) return ico(name.slice(4));
    return params[name] ?? `{${name}}`;
  });
}

export function onLanguageChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let _lastLang = Settings.getLanguage();
Settings.onChange(() => {
  const lang = Settings.getLanguage();
  if (lang === _lastLang) return;
  _lastLang = lang;
  for (const cb of listeners) { try { cb(); } catch {} }
});

export function applyDomTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.documentElement.lang = Settings.getLanguage();
}
