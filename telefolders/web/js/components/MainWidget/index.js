import i18n from "../../i18n.js";
import Table from "../TableWidget/index.js";
import Login from "../LoginWidget/index.js";
import Header from "../HeaderWidget/index.js";
import Popup from "../PopupWidget/index.js";

export default class Main {
  constructor() {
    this.loginInstance = null;
    this.headerInstance = null;
  }

  async init() {
    let response = await eel.init()();

    // Sync language from server after Eel is connected
    try {
      const serverLang = await eel.get_language()();
      if (serverLang && serverLang !== i18n.locale) {
        i18n.locale = serverLang;
        await i18n.load();
        i18n.applyToDOM();
      }
    } catch (e) {
      // ignore
    }

    if (!response.success) {
      const popupComponent = new Popup(`
        <div class='popup-content'>
          <h2>${i18n.t("error.title")}</h2>
          <p>${i18n.t("error.generic")}</p>
          <p>
            <a
              style="color: blue; text-decoration: underline;"
              href="https://t.me/+4iWgAed_aDYyMWEy"
            >
              ${i18n.t("error.report")}
            </a>
          </p>
          <div class='buttons'>
            <button id='popup-done'>${i18n.t("button.ok")}</button>
          </div>
        </div>
      `);

      popupComponent.show();

      function closeHandler() {
        popupComponent.close();
      }

      document
        .getElementById("popup-done")
        .addEventListener("click", closeHandler, { once: true });
    } else {
      response = await eel.get_user()();

      if (response === null) {
        document.querySelector(".spinner_large").classList.add("hide");
        const login = new Login();
        login.init();
        this.loginInstance = login;

        document.querySelector(".login").classList.remove("hide");
        document.querySelector(".spinner_large").classList.add("hide");
      } else {
        localStorage.setItem("user-id", response.id);

        const header = new Header(response);
        this.headerInstance = header;

        new Table().getData();

        header.changeAvatar(response.picture);
      }
    }
  }
}
