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

    // Apply initial translations to static elements
    this.applyTranslations();

    // Add CSV export/import items to user menu
    this.addCsvMenuItems();
  };

  /**
   * @method addCsvMenuItems
   * @description Add CSV export/import menu items
   */
  addCsvMenuItems = () => {
    const userMenu = this.userMenuElement;

    // Export CSV
    const exportBtn = document.createElement("p");
    exportBtn.className = "csv-export";
    exportBtn.setAttribute("data-i18n", "header.export_csv");
    exportBtn.textContent = i18n.t("header.export_csv");
    exportBtn.addEventListener("click", this.handleExportCsv);
    userMenu.appendChild(exportBtn);

    // Import CSV
    const importBtn = document.createElement("p");
    importBtn.className = "csv-import";
    importBtn.setAttribute("data-i18n", "header.import_csv");
    importBtn.textContent = i18n.t("header.import_csv");
    importBtn.addEventListener("click", this.handleImportCsv);
    userMenu.appendChild(importBtn);

    // Hidden file input for import
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv";
    fileInput.style.display = "none";
    fileInput.addEventListener("change", this.handleImportFile);
    document.body.appendChild(fileInput);
    this.csvFileInput = fileInput;
  };

  /**
   * @method handleExportCsv
   * @description Export folder assignments to CSV
   */
  handleExportCsv = async () => {
    try {
      const response = await eel.export_csv()();
      if (response.success) {
        // Create download
        const bom = "\uFEFF";
        const blob = new Blob([bom + response.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "telefolders_export.csv";
        link.click();
        URL.revokeObjectURL(url);
      } else {
        console.error("Export failed:", response.error);
      }
    } catch (e) {
      console.error("Export error:", e);
    }
    this.userMenuElement.classList.add("hide");
  };

  /**
   * @method handleImportCsv
   * @description Trigger file picker for CSV import
   */
  handleImportCsv = () => {
    this.csvFileInput.click();
    this.userMenuElement.classList.add("hide");
  };

  /**
   * @method handleImportFile
   * @description Handle selected CSV file
   */
  handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvString = e.target.result;
      await this.processCsvImport(csvString);
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = "";
  };

  /**
   * @method processCsvImport
   * @description Validate and import CSV
   */
  processCsvImport = async (csvString) => {
    try {
      // First pass: validate without force
      let response = await eel.import_csv(csvString, false)();

      if (response.success) {
        // All good, refresh table
        await this.table.getData();
        return;
      }

      // Check if it's an order mismatch (count matches but order differs)
      if (response.validation && response.validation.count_match && !response.validation.order_match) {
        // Show popup asking user to continue or cancel
        this.showImportMismatchPopup(csvString);
        return;
      }

      // Other error (count mismatch, etc.)
      console.error("Import failed:", response.error);
      alert(response.error || "Import failed");
    } catch (e) {
      console.error("Import error:", e);
    }
  };

  /**
   * @method showImportMismatchPopup
   * @description Show popup for folder order mismatch
   */
  showImportMismatchPopup = (csvString) => {
    // Simple confirm dialog
    const confirmed = confirm("Folder 顺序不一致. 是否继续导入?");
    if (confirmed) {
      // Retry with force=true
      eel.import_csv(csvString, true)(async (response) => {
        if (response.success) {
          await this.table.getData();
        } else {
          alert("Import failed: " + (response.error || "Unknown error"));
        }
      });
    }
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

    // Update dynamically created CSV menu items
    const exportBtn = this.userMenuElement.querySelector(".csv-export");
    if (exportBtn) {
      exportBtn.textContent = i18n.t("header.export_csv");
    }
    const importBtn = this.userMenuElement.querySelector(".csv-import");
    if (importBtn) {
      importBtn.textContent = i18n.t("header.import_csv");
    }
  }

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
