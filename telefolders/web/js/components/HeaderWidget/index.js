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

    // Setup filter buttons (one by one)
    this.initArchiveFilter();
    this.initPersonalFilter();
    this.initBotFilter();
    this.initGroupFilter();
    this.initChannelFilter();
  };

  /**
   * @method initArchiveFilter
   * @description Setup Archived filter button (✅Archived / ❌Archived)
   */
  initArchiveFilter = () => {
    const btn = document.querySelector('[data-type="archived"]');
    if (!btn) return;

    // Set initial icon
    this.updateArchiveFilterUI(btn);

    // Bind click handler
    btn.addEventListener('click', () => {
      const current = localStorage.getItem('archiveState') || 'false';
      const next = current === 'true' ? 'false' : 'true';
      localStorage.setItem('archiveState', next);
      this.updateArchiveFilterUI(btn);

      if (next === 'true') {
        this.table.hideArchive();
      } else {
        this.table.showArchive();
      }
    });
  };

  /**
   * @method updateArchiveFilterUI
   * @description Update ✅/❌ icon on archive filter button
   */
  updateArchiveFilterUI = (btn) => {
    const hidden = localStorage.getItem('archiveState') === 'true';
    if (hidden) {
      btn.dataset.active = 'false'; // ❌ = hidden
    } else {
      btn.dataset.active = 'true';  // ✅ = showing
    }
  };

  /**
   * @method initPersonalFilter
   * @description Setup Personal Chat filter button (✅Personal / ❌Personal)
   */
  initPersonalFilter = () => {
    const btn = document.querySelector('[data-type="personal"]');
    if (!btn) return;

    // Set initial icon
    this.updatePersonalFilterUI(btn);

    // Bind click handler
    btn.addEventListener('click', () => {
      const current = localStorage.getItem('personalState') || 'false';
      const next = current === 'true' ? 'false' : 'true';
      localStorage.setItem('personalState', next);
      this.updatePersonalFilterUI(btn);

      if (next === 'true') {
        this.table.hidePersonal();
      } else {
        this.table.showPersonal();
      }
    });
  };

  updatePersonalFilterUI = (btn) => {
    const hidden = localStorage.getItem('personalState') === 'true';
    if (hidden) {
      btn.dataset.active = 'false';
    } else {
      btn.dataset.active = 'true';
    }
  };

  // ===== Bot Filter =====
  initBotFilter = () => {
    const btn = document.querySelector('[data-type="bot"]');
    if (!btn) return;
    this.updateBotFilterUI(btn);
    btn.addEventListener('click', () => {
      const next = localStorage.getItem('botState') === 'true' ? 'false' : 'true';
      localStorage.setItem('botState', next);
      this.updateBotFilterUI(btn);
      next === 'true' ? this.table.hideBot() : this.table.showBot();
    });
  };

  updateBotFilterUI = (btn) => {
    btn.dataset.active = localStorage.getItem('botState') === 'true' ? 'false' : 'true';
  };

  // ===== Group Filter =====
  initGroupFilter = () => {
    const btn = document.querySelector('[data-type="group"]');
    if (!btn) return;
    this.updateGroupFilterUI(btn);
    btn.addEventListener('click', () => {
      const next = localStorage.getItem('groupState') === 'true' ? 'false' : 'true';
      localStorage.setItem('groupState', next);
      this.updateGroupFilterUI(btn);
      next === 'true' ? this.table.hideGroup() : this.table.showGroup();
    });
  };

  updateGroupFilterUI = (btn) => {
    btn.dataset.active = localStorage.getItem('groupState') === 'true' ? 'false' : 'true';
  };

  // ===== Channel Filter =====
  initChannelFilter = () => {
    const btn = document.querySelector('[data-type="channel"]');
    if (!btn) return;
    this.updateChannelFilterUI(btn);
    btn.addEventListener('click', () => {
      const next = localStorage.getItem('channelState') === 'true' ? 'false' : 'true';
      localStorage.setItem('channelState', next);
      this.updateChannelFilterUI(btn);
      next === 'true' ? this.table.hideChannel() : this.table.showChannel();
    });
  };

  updateChannelFilterUI = (btn) => {
    btn.dataset.active = localStorage.getItem('channelState') === 'true' ? 'false' : 'true';
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

  handleExportCsv = async () => {
    try {
      const response = await eel.export_csv()();
      if (response.success) {
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

  handleImportCsv = () => {
    this.csvFileInput.click();
    this.userMenuElement.classList.add("hide");
  };

  handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvString = e.target.result;
      await this.processCsvImport(csvString);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  processCsvImport = async (csvString) => {
    try {
      let response = await eel.import_csv(csvString, false)();

      if (response.success) {
        await this.table.getData();
        return;
      }

      if (response.validation && response.validation.count_match && !response.validation.order_match) {
        this.showImportMismatchPopup(csvString);
        return;
      }

      console.error("Import failed:", response.error);
      alert(response.error || "Import failed");
    } catch (e) {
      console.error("Import error:", e);
    }
  };

  showImportMismatchPopup = (csvString) => {
    const confirmed = confirm("Folder 顺序不一致. 是否继续导入?");
    if (confirmed) {
      eel.import_csv(csvString, true)(async (response) => {
        if (response.success) {
          await this.table.getData();
        } else {
          alert("Import failed: " + (response.error || "Unknown error"));
        }
      });
    }
  };

  applyTranslations() {
    const reloadChatsList = document.getElementById("reloadChatsList");
    if (reloadChatsList) {
      reloadChatsList.textContent = i18n.t("header.reload");
    }

    const logout = this.userMenuElement.querySelector(".logout");
    if (logout) {
      logout.textContent = i18n.t("header.logout");
    }

    const exportBtn = this.userMenuElement.querySelector(".csv-export");
    if (exportBtn) {
      exportBtn.textContent = i18n.t("header.export_csv");
    }
    const importBtn = this.userMenuElement.querySelector(".csv-import");
    if (importBtn) {
      importBtn.textContent = i18n.t("header.import_csv");
    }
  }

  changeAvatar = (picture) => {
    this.avatarContainerElement.querySelector(".header .avatar img").src =
      picture ? picture : "/img/contacts.png";
  };

  handleAvatarClick = (event) => {
    event.stopPropagation();

    if (this.userMenuElement.className === "user-menu") {
      this.userMenuElement.classList.add("hide");
    } else if (this.userMenuElement.className === "user-menu hide") {
      this.userMenuElement.classList.remove("hide");
    }

    if (event.target.className === "reloadChatsList") {
      this.reloadChats();
    } else if (event.target.className === "logout") {
      this.logout(event);
    } else if (event.target.className === "user-menu") {
    } else if (event.target.alt === "avatar") return;

    this.userMenuElement.querySelector(".username").textContent =
      "@" + this.data.username;
  };

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

  reloadChats = () => {
    this.table.updateChats();
    this.userMenuElement.classList.add("hide");
  };

  logout = () => {
    eel.logout()();
    document.querySelector(".spinner_large").classList.add("hide");
    document.querySelector(".table-container.main-table").classList.add("hide");
    const login = new Login();
    login.init();
  };
}
