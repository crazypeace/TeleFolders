import i18n from "../../i18n.js";
import Popup from "../PopupWidget/index.js";

/**
 * @class Login
 * @classdesc Handles user authorization via Telegram
 */
export default class Login {
  constructor() {
    this.container = document.querySelector(".login");
    this.state = "phone";
  }

  /**
   * @method init
   * @description Initialize login widget
   */
  init() {
    this.container = document.querySelector(".login");

    if (!this.container) {
      const mainEl = document.querySelector(".app main.main") || document.querySelector(".app");
      mainEl.insertAdjacentHTML(
        "beforeend",
        `<div class="login"></div>`,
      );
      this.container = document.querySelector(".login");
    }

    this.container.classList.remove("hide");
    this.render();
    this.addEventListeners();
  }

  /**
   * @method render
   * @description Render login form
   */
  render() {
    this.container.innerHTML = /* html */ `
      <div class="login-container">
        <div class="login-form">
          <h3>${i18n.t("login.not_authorized")}</h3>
          <p class="login-label">${i18n.t("login.phone_label")}</p>
          <p class="login-error hide">
            ${i18n.t("login.invalid_phone")}
          </p>
          <div class="login-input-container">
            <input type="tel" class="login-input" placeholder="${i18n.t("login.phone_placeholder")}" />
            <button class="login-button">${i18n.t("login.submit")}</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @method addEventListeners
   * @description Add keyboard and click listeners
   */
  addEventListeners() {
    this.inputElement = this.container.querySelector(".login-input");
    this.loginButton = this.container.querySelector(".login-button");
    this.loginError = this.container.querySelector(".login-error");
    this.loginLabel = this.container.querySelector(".login-label");

    this.inputElement.addEventListener("keydown", this.handleKeyDown);
    this.loginButton.addEventListener("click", this.handleLogin);
  }

  /**
   * @method handleKeyDown
   * @description Handle Enter key to submit
   * @param {Event} event
   */
  handleKeyDown = (event) => {
    if (event.key === "Enter") {
      this.loginButton.click();
    }
  };

  /**
   * @method handleLogin
   * @description Dispatch login based on current state
   */
  handleLogin = () => {
    if (this.state === "phone") {
      this.handlePhoneSubmit();
    } else if (this.state === "code") {
      this.handleCodeSubmit();
    } else if (this.state === "password") {
      this.handlePasswordSubmit();
    }
  };

  /**
   * @method handlePhoneSubmit
   * @description Submit phone number
   */
  handlePhoneSubmit = async () => {
    const phone = this.inputElement.value.trim();

    if (!phone) {
      this.loginError.textContent = i18n.t("login.invalid_phone");
      this.loginError.classList.remove("hide");
      return;
    }

    this.loginButton.disabled = true;
    this.loginButton.textContent = "...";

    try {
      const response = await eel.login_phone(phone)();

      if (response.success) {
        this.phone = phone;
        this.phoneCodeHash = response.phone_code_hash;
        this.state = "code";
        this.updateForm("code");
      } else {
        this.loginError.textContent = i18n.t("login.invalid_phone");
        this.loginError.classList.remove("hide");
      }
    } catch (e) {
      this.loginError.textContent = i18n.t("login.invalid_phone");
      this.loginError.classList.remove("hide");
    }

    this.loginButton.disabled = false;
    this.loginButton.textContent = i18n.t("login.submit");
  };

  /**
   * @method handleCodeSubmit
   * @description Submit confirmation code
   */
  handleCodeSubmit = async () => {
    const code = this.inputElement.value.trim();

    if (!code) {
      this.loginError.textContent = i18n.t("login.invalid_code");
      this.loginError.classList.remove("hide");
      return;
    }

    this.loginButton.disabled = true;
    this.loginButton.textContent = "...";

    try {
      const response = await eel.login_code(this.phone, code)();

      if (response.success) {
        if (response.need_password) {
          this.state = "password";
          this.updateForm("password");
        } else {
          this.showSuccessPopup();
        }
      } else {
        this.loginError.textContent = i18n.t("login.invalid_code");
        this.loginError.classList.remove("hide");
      }
    } catch (e) {
      this.loginError.textContent = i18n.t("login.invalid_code");
      this.loginError.classList.remove("hide");
    }

    this.loginButton.disabled = false;
    this.loginButton.textContent = i18n.t("login.submit");
  };

  /**
   * @method handlePasswordSubmit
   * @description Submit 2FA password
   */
  handlePasswordSubmit = async () => {
    const password = this.inputElement.value.trim();

    if (!password) {
      this.loginError.textContent = i18n.t("login.invalid_password");
      this.loginError.classList.remove("hide");
      return;
    }

    this.loginButton.disabled = true;
    this.loginButton.textContent = "...";

    try {
      const response = await eel.login_password(
        this.phone,
        password,
        this.phoneCodeHash,
      )();

      if (response.success) {
        this.showSuccessPopup();
      } else {
        this.loginError.textContent = i18n.t("login.invalid_password");
        this.loginError.classList.remove("hide");
      }
    } catch (e) {
      this.loginError.textContent = i18n.t("login.invalid_password");
      this.loginError.classList.remove("hide");
    }

    this.loginButton.disabled = false;
    this.loginButton.textContent = i18n.t("login.submit");
  };

  /**
   * @method updateForm
   * @description Update form labels based on state
   * @param {String} type form state: "phone", "code", or "password"
   */
  updateForm(type) {
    this.loginError.classList.add("hide");
    this.inputElement.value = "";

    if (type === "phone") {
      this.loginLabel.textContent = i18n.t("login.phone_label");
      this.loginError.textContent = i18n.t("login.invalid_phone");
      this.inputElement.placeholder = i18n.t("login.phone_placeholder");
      this.inputElement.type = "tel";
    } else if (type === "code") {
      this.loginLabel.textContent = i18n.t("login.code_label");
      this.loginError.textContent = i18n.t("login.invalid_code");
      this.inputElement.placeholder = i18n.t("login.code_placeholder");
      this.inputElement.type = "text";
    } else if (type === "password") {
      this.loginLabel.textContent = i18n.t("login.password_label");
      this.loginError.textContent = i18n.t("login.invalid_password");
      this.inputElement.placeholder = i18n.t("login.password_placeholder");
      this.inputElement.type = "password";
    }
  }

  /**
   * @method showSuccessPopup
   * @description Show success authorization popup
   */
  showSuccessPopup() {
    const popupComponent = new Popup(/* html */ `
      <div class='popup-content'>
        <h2>${i18n.t("login.success_title")}</h2>
        <p>${i18n.t("login.success_hint")}</p>
        <div class='buttons'>
          <button id='popup-done'>${i18n.t("button.ok_upper")}</button>
        </div>
      </div>
    `);

    popupComponent.show();

    document
      .getElementById("popup-done")
      .addEventListener("click", () => {
        popupComponent.close();
        window.location.reload();
      }, { once: true });
  }

  /**
   * @method showErrorPopup
   * @description Show error popup
   */
  showErrorPopup() {
    const popupComponent = new Popup(/* html */ `
      <div class='popup-content'>
        <h2>${i18n.t("login.error_title")}</h2>
        <p>${i18n.t("login.error_hint")}</p>
        <div class='buttons'>
          <button id='popup-done'>${i18n.t("button.ok_upper")}</button>
        </div>
      </div>
    `);

    popupComponent.show();

    document
      .getElementById("popup-done")
      .addEventListener("click", () => {
        popupComponent.close();
      }, { once: true });
  }
}
