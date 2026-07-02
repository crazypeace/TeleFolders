/**
 * @class I18n
 * @classdesc Lightweight i18n engine for TeleFolders
 */
class I18n {
  constructor() {
    this.locale = "ru";
    this.translations = {};
  }

  /**
   * @method load
   * @description Load translation file for current locale
   */
  async load() {
    try {
      const resp = await fetch(`/locales/${this.locale}.json`);
      this.translations = await resp.json();
    } catch (e) {
      console.error(`Failed to load locale "${this.locale}":`, e);
    }
  }

  /**
   * @method t
   * @description Translate a key to current locale
   * @param {String} key translation key
   * @returns {String} translated string or key if not found
   */
  t(key) {
    return this.translations[key] || key;
  }

  /**
   * @method applyToDOM
   * @description Update all elements with data-i18n attribute
   */
  applyToDOM() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key);
    });
  }

  /**
   * @method init
   * @description Determine locale: server > localStorage > default "ru"
   */
  async init() {
    // Try to get language from server first
    try {
      if (typeof eel !== "undefined") {
        const result = await eel.get_language()();
        if (result) {
          this.locale = result;
        }
      }
    } catch (e) {
      // Eel not ready yet, fall back to localStorage
    }

    // If server didn't return anything, check localStorage
    if (!this.locale || this.locale === "ru") {
      const saved = localStorage.getItem("locale");
      if (saved) {
        this.locale = saved;
      }
    }

    // Persist to localStorage
    localStorage.setItem("locale", this.locale);

    await this.load();
  }

  /**
   * @method setLocale
   * @description Change locale, reload translations, notify listeners
   * @param {String} locale locale code (e.g. "ru", "en")
   */
  async setLocale(locale) {
    this.locale = locale;
    localStorage.setItem("locale", locale);
    await this.load();
    this.applyToDOM();

    // Sync with server
    try {
      if (typeof eel !== "undefined") {
        await eel.set_language(locale)();
      }
    } catch (e) {
      // ignore
    }

    document.dispatchEvent(new Event("locale-changed"));
  }
}

const i18n = new I18n();
export default i18n;
