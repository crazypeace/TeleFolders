/**
 * @class I18n
 * @classdesc Lightweight i18n engine for TeleFolders
 */
class I18n {
  constructor() {
    this.locale = "en";
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
   * @method loadDefault
   * @description Load default locale (before Eel connects)
   */
  async loadDefault() {
    await this.load();
    this.applyToDOM();
  }

  /**
   * @method init
   * @description Determine locale: server > default "ru"
   */
  async init() {
    // Get language from server (set via --lang CLI arg)
    try {
      if (typeof eel !== "undefined") {
        const result = await eel.get_language()();
        if (result) {
          this.locale = result;
        }
      }
    } catch (e) {
      // Eel not ready yet, use default
    }

    await this.load();
    this.applyToDOM();
  }
}

const i18n = new I18n();
export default i18n;
