import i18n from "../../i18n.js";
import Login from "../LoginWidget/index.js";
import Table from "../TableWidget/index.js";

/**
 * @class Header
 * @classdesc Handles header interactions
 */
export default class Header {
  /**
   * @constructor
   * @param {Object} data user data
   */
  constructor(data) {
    this.data = data;
    this.avatarContainerElement = document.querySelector(".avatar");
    this.userMenuElement = document.querySelector(".user-menu");
    this.init();
    this.table = new Table();

    document.addEventListener("locale-changed", () => {
      this.applyTranslations();
    });
  }

  /**
   * @method init
   * @description Initialize header listeners
   */
  init = () => {
    this.avatarContainerElement.addEventListener(
      "click",
      this.handleAvatarClick,
    );
    window.addEventListener("click", this.handleWindowClick);

    // Initialize language switcher text
    this.updateLangSwitch();

    // Language switcher click
    const langSwitch = document.getElementById("langSwitch");
    if (langSwitch) {
      langSwitch.addEventListener("click", this.handleLangSwitch);
    }

    // Apply initial translations to static elements
    this.applyTranslations();
  };

  /**
   * @method applyTranslations
   * @description Update all translated text in the header
   */
  applyTranslations() {
    const hideArchived = document.getElementById("hideArchived");
    if (hideArchived) {
      const isHidden =
        localStorage.getItem("archiveState") === "false";
      hideArchived.textContent = isHidden
        ? i18n.t("header.show_archived")
        : i18n.t("header.hide_archived");
    }

    const reloadChatsList = document.getElementById("reloadChatsList");
    if (reloadChatsList) {
      reloadChatsList.textContent = i18n.t("header.reload");
    }

    const logout = this.userMenuElement.querySelector(".logout");
    if (logout) {
      logout.textContent = i18n.t("header.logout");
    }

    this.updateLangSwitch();
  }

  /**
   * @method updateLangSwitch
   * @description Update language switcher text
   */
  updateLangSwitch() {
    const langSwitch = document.getElementById("langSwitch");
    if (langSwitch) {
      langSwitch.textContent =
        i18n.locale === "ru" ? "English" : "Русский";
    }
  }

  /**
   * @method handleLangSwitch
   * @description Switch language
   */
  handleLangSwitch = async (event) => {
    event.stopPropagation();
    const newLocale = i18n.locale === "ru" ? "en" : "ru";
    await i18n.setLocale(newLocale);
    // Refresh table data to re-render with new language
    this.table.drawChats();
  };

  /**
   * @method changeAvatar
   * @description Change avatar image
   * @param {String} picture
   */
  changeAvatar = (picture) => {
    this.avatarContainerElement.querySelector(".header .avatar img").src =
      picture ? picture : "/img/contacts.png";
  };

  /**
   * @method handleAvatarClick
   * @description Delegate avatar menu events
   * @param {Event} event
   */
  handleAvatarClick = (event) => {
    event.stopPropagation();

    if (JSON.parse(localStorage.getItem("archiveState"))) {
      const element = this.userMenuElement.querySelector(".hideArchived");
      element.textContent = i18n.t("header.hide_archived");
    } else if (
      JSON.parse(localStorage.getItem("archiveState")) === "false"
    ) {
      const element = this.userMenuElement.querySelector(".hideArchived");
      element.textContent = i18n.t("header.show_archived");
    }

    if (this.userMenuElement.className === "user-menu") {
      this.userMenuElement.classList.add("hide");
    } else if (this.userMenuElement.className === "user-menu hide") {
      this.userMenuElement.classList.remove("hide");
    }

    if (event.target.className === "hideArchived") {
      this.changeText();
    } else if (event.target.className === "reloadChatsList") {
      this.reloadChats();
    } else if (event.target.className === "logout") {
      this.logout(event);
    } else if (event.target.className === "user-menu") {
    } else if (event.target.alt === "avatar") return;

    this.userMenuElement.querySelector(".username").textContent =
      "@" + this.data.username;
  };

  /**
   * @method handleWindowClick
   * @description Close menu on outside click
   * @param {Event} event
   */
  handleWindowClick = (event) => {
    if (
      event.target !== this.avatarContainerElement &&
      !this.avatarContainerElement.contains(event.target) &&
      event.target !== this.userMenuElement &&
      !this.userMenuElement.contains(event.target)
    ) {
      this.userMenuElement.classList.add("hide");
    }
  };

  /**
   * @method changeText
   * @description Toggle archive visibility text
   */
  changeText() {
    const element = this.userMenuElement.querySelector(".hideArchived");

    if (localStorage.getItem("archiveState") === "true") {
      this.table.hideArchive();
      element.textContent = i18n.t("header.show_archived");
    } else if (localStorage.getItem("archiveState") === "false") {
      this.table.showArchive();
      element.textContent = i18n.t("header.hide_archived");
    }
  }

  /**
   * @method reloadChats
   * @description Reload chat list
   */
  reloadChats = () => {
    this.table.updateChats();
    this.userMenuElement.classList.add("hide");
  };

  /**
   * @method logout
   * @description Log out
   */
  logout = () => {
    eel.logout()();
    document.querySelector(".spinner_large").classList.add("hide");
    document.querySelector(".table-container.main-table").classList.add("hide");
    const login = new Login();
    login.init();
  };
}
