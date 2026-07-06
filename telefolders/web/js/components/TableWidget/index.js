import i18n from "../../i18n.js";
import Popup from "../PopupWidget/index.js";
import FloatView from "../FloatViewWidget/index.js";

/**
 * @class Table
 * @classdesc Main table widget for chats and folders
 */
export default class Table {
  /**
   * @constructor
   * @returns {Table.instance} singleton
   */
  constructor() {
    if (!Table.instance) {
      Table.instance = this;
    }
    return Table.instance;
  }

  /**
   * @method hideArchive
   * @description Hide archived chats from table
   */
  hideArchive() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }

  /**
   * @method showArchive
   * @description Show archived chats in table
   */
  showArchive() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }

  /**
   * @method hidePersonal
   * @description Hide personal chats from table
   */
  hidePersonal() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }

  /**
   * @method showPersonal
   * @description Show personal chats in table
   */
  showPersonal() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }

  hideBot() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }
  showBot() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }

  hideGroup() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }
  showGroup() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }

  hideChannel() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }
  showChannel() {
    if (this.chats && this.folders) {
      this.drawChats();
    }
  }

  /**
   * @method getData
   * @description Fetch chats and folders data
   */
  getData = async () => {
    document.querySelector(".table-container.main-table").classList.add("hide");
    document.querySelector(".spinner_large").classList.remove("hide");

    this.chats = await eel.get_all_chats()();
    this.folders = await eel.get_folders()();

    this.drawHeader();
    this.drawChats();
  };

  /**
   * @method getChats
   * @description Fetch chats
   */
  getChats = async () => {
    return await eel.get_all_chats()();
  };

  /**
   * @method getFolders
   * @description Fetch folders
   */
  getFolders = async () => {
    return await eel.get_folders()();
  };

  /**
   * @method drawHeader
   * @description Draw table header
   */
  async drawHeader() {
    document
      .querySelector(".table-container.main-table")
      .classList.remove("hide");
    document.querySelector(".spinner_large").classList.add("hide");

    const trElement = document.querySelector(
      ".table-container .table thead tr",
    );
    trElement.textContent = "";
    const folders = this.folders;

    let tableHead = "";

    tableHead += /* html */ `
      <th class="th">${i18n.t("table.all_chats")}</th>
    `;

    tableHead += /* html */ `
        <th>
          <span>${i18n.t("table.archive")}</span>
        </th>
      `;

    folders.map((value) => {
      tableHead += /* html */ `
        <th class="th"><span>${value.folder_title}</span></th>
      `;
    });

    tableHead += /* html */ `
      <th  class="th" id='add-folder'>+</th>
    `;

    trElement.insertAdjacentHTML("beforeend", tableHead);

    document
      .getElementById("add-folder")
      .addEventListener("click", this.handleAddFolder);
  }

  /**
   * @method handleAddFolder
   * @description Show popup to add a new folder
   */
  handleAddFolder = () => {
    const popupComponent = new Popup(`
      <div class='popup-content'>
        <h2>${i18n.t("popup.add_folder")}</h2>
        <label for='folder-name'>${i18n.t("popup.folder_name_label")}</label>
        <input id='folder-name' type='text' />
        <div class='buttons'>
          <button id='popup-done'>${i18n.t("popup.add")}</button>
          <button id='popup-cancle'>${i18n.t("popup.cancel")}</button>
        </div>
      </div>
    `);

    popupComponent.show();

    const doneBtn = document.getElementById("popup-done");
    const cancelBtn = document.getElementById("popup-cancle");
    const folderInput = document.getElementById("folder-name");
    const table = this;

    function addFolderHandler() {
      const title = folderInput.value.trim();
      if (!title) return;

      doneBtn.disabled = true;
      doneBtn.textContent = "...";

      eel.create_folder(title)(async (response) => {
        popupComponent.close();
        if (response.success) {
          await table.getData();
        } else {
          console.error("Failed to create folder:", response.error);
        }
      });
    }

    function cancleHandler() {
      popupComponent.close();
    }

    doneBtn.addEventListener("click", addFolderHandler, { once: true });
    cancelBtn.addEventListener("click", cancleHandler, { once: true });
  };

  /**
   * @method getFilteredChats
   * @description Return chats after applying all active filter states
   * @returns {Array} filtered chats
   */
  getFilteredChats() {
    let chats = this.chats;
    if (!chats) return [];

    if (localStorage.getItem('archiveState') === 'true') {
      chats = chats.filter(c => !c.archived);
    }
    if (localStorage.getItem('personalState') === 'true') {
      chats = chats.filter(c => !c.is_private_user);
    }
    if (localStorage.getItem('botState') === 'true') {
      chats = chats.filter(c => !c.is_bot);
    }
    if (localStorage.getItem('groupState') === 'true') {
      chats = chats.filter(c => !c.is_group);
    }
    if (localStorage.getItem('channelState') === 'true') {
      chats = chats.filter(c => !c.is_channel);
    }
    return chats.sort((a, b) => a.chat_id - b.chat_id);
  }

  /**
   * @method _escapeCSVField
   * @description Escape a single CSV field (Python csv.writer QUOTE_MINIMAL compatible)
   * @param {*} value
   * @returns {String}
   */
  _escapeCSVField(value) {
    const s = String(value ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  /**
   * @method generateCSV
   * @description Generate CSV text from chats and folders (frontend-side)
   * @param {Array} chats - list of chat objects
   * @param {Array} folders - list of folder objects
   * @returns {String} CSV text (CRLF line endings)
   */
  generateCSV(chats, folders) {
    const lines = [];

    // Header: chat_id, chat_name, folder1, folder2, ...
    const header = ['chat_id', 'chat_name', ...folders.map(f => f.folder_title)];
    lines.push(header.map(v => this._escapeCSVField(v)).join(','));

    // Data rows
    for (const chat of chats) {
      const row = [chat.chat_id, chat.title];
      for (const folder of folders) {
        const fid = folder.folder_id;
        if (chat.folders.include.includes(fid)) row.push('include');
        else if (chat.folders.pinned.includes(fid)) row.push('pinned');
        else if (chat.folders.exclude.includes(fid)) row.push('exclude');
        else row.push('empty');
      }
      lines.push(row.map(v => this._escapeCSVField(v)).join(','));
    }

    return lines.join('\r\n');
  }

  /**
   * @method drawChats
   * @description Draw chat table
   */
  async drawChats() {
    const chats = this.getFilteredChats();

    const folders = this.folders;
    const tbodyElement = document.querySelector(
      ".table-container .table tbody",
    );
    tbodyElement.textContent = "";

    let html = "";

    // Draw chat name td
    if (folders.length === 0) {
      chats.map((value) => {
        html += /* html */ `
          <tr>
            <td data-id="${value.chat_id}" class="title">${value.title}</td>
          </tr>
        `;
      });
      tbodyElement.insertAdjacentHTML("beforeend", html);
      return;
    }

    function setName(value) {
      const flags = {
        contacts: i18n.t("table.flag.contacts"),
        non_contacts: i18n.t("table.flag.non_contacts"),
        groups: i18n.t("table.flag.groups"),
        broadcasts: i18n.t("table.flag.broadcasts"),
        bots: i18n.t("table.flag.bots"),
        exclude_muted: i18n.t("table.flag.exclude_muted"),
        exclude_read: i18n.t("table.flag.exclude_read"),
        exclude_archived: i18n.t("table.flag.exclude_archived"),
      };

      return flags[value];
    }

    // Draw flag rows
    Object.keys(folders[0].flags).map((value) => {
      html += /* html */ `
          <tr>
            <th>${setName(value)}</th>
            <td></td>
            ${folders
              .map((folder) => {
                return /* html */ `
                  <td
                    class="td flag"
                    data-flag="${value}"
                    data-flag-state="${folder.flags[value]}"
                    data-folder-id="${folder.folder_id}"
                  >
                    <div class='buttons flag'>${this.setFlugsButton(
                      folder,
                      value,
                    )}</div>
                  </td>
                `;
              })
              .join("")}
          </tr>
    `;
    });

    // Draw chat rows
    chats.map((value, index) => {
      const id = Number(localStorage.getItem("user-id"));
      const imagePath = value.archived
        ? "/img/svg/plus-black.svg"
        : "/img/svg/plus-white.svg";

      html += /* html */ `
              <tr
                data-chat-index="${index}"
                data-archive-state="${value.archived}"
                data-chat-id="${value.chat_id}"
              >
                <th
                  data-chat-id="${value.chat_id}"
                  th title
                >
                  <div class='wrapper'>
                    <p class="title">
                      ${id === value.chat_id ? i18n.t("table.favorites") : value.title}
                    </p>
                  </div>
                </th>
                <td>
                  <div class="buttons">
                    <button class="button archive">
                      <img src="${imagePath}"/>
                    </button>
                  </div>
                </td>
                ${folders
                  .map((folder) => {
                    return /* html */ `
                    <td
                      data-chat-id="${value.chat_id}"
                      data-folder-id="${folder.folder_id}"
                    >
                      <div class="buttons">
                        ${this.setChatsButtons(folder.folder_id, value)}
                      </div>
                    </td>
                  `;
                  })
                  .join("")}
              </tr>
            `;
    });

    tbodyElement.innerHTML = html;

    tbodyElement.removeEventListener("click", this.handleClick);
    tbodyElement.addEventListener("click", this.handleClick);
  }

  /**
   * @method handleClick
   * @description Delegate table click events
   * @param {Event} event
   */
  handleClick = (event) => {
    const button = event.target.closest("button");
    const target = button || event.target;
    
    if (target.className === "button exclude") {
      this.setChatRelation(target, null);
    } else if (target.className === "button include") {
      this.setChatRelation(target, "pinned");
    } else if (target.className === "button pinned") {
      this.setChatRelation(target, "exclude");
    } else if (target.className === "button null") {
      this.setChatRelation(target, "include");
    } else if (target.className === "button archive") {
      this.setArchiveRelation(target);
    } else if (target.className === "buttons flag") {
      let _event = target.parentElement;
      this.setFlagRelation(_event);
    } else if (target.className === "button flag") {
      let _event = target.parentElement.parentElement;
      this.setFlagRelation(_event);
    } else if (target.className === "th title") {
      const parent = target.parentElement;
      const chatIndex = parent.getAttribute("data-chat-index");

      const floatView = new FloatView();

      floatView.close();
      floatView.chatIndex = chatIndex;
      floatView.show();
    } else if (target.className === "title") {
      const parent = target.parentElement.parentElement.parentElement;
      const chatIndex = parent.getAttribute("data-chat-index");

      const floatView = new FloatView();

      floatView.close();
      floatView.chatIndex = chatIndex;
      floatView.show();
    }
  };

  /**
   * @method setChatsButtons
   * @description Return button HTML for a chat
   * @param {String | Number} folderId
   * @param {Object} userInfo
   * @returns {String} HTML string
   */
  setChatsButtons(folderId, userInfo) {
    let imagePath = "/img/svg/plus-white.svg";
    let value = "";

    if (userInfo.folders["include"].includes(folderId)) {
      imagePath = "/img/svg/plus-black.svg";
      value = "include";
    } else if (userInfo.folders["exclude"].includes(folderId)) {
      imagePath = "/img/svg/minus-black.svg";
      value = "exclude";
    } else if (userInfo.folders["pinned"].includes(folderId)) {
      imagePath = "/img/svg/pin-black.svg";
      value = "pinned";
    } else {
      imagePath = "/img/svg/plus-white.svg";
      value = "null";
    }

    let html = /* html */ `
      <button
        class='button ${value}'
      >
        <img src='${imagePath}' />
      </button>
    `;

    return html;
  }

  /**
   * @method setFlugsButton
   * @description Return flag button HTML
   * @param {Object} folder
   * @param {String} folderFlag
   * @returns {String} HTML string
   */
  setFlugsButton = (folder, folderFlag) => {
    let html = ["exclude_muted", "exclude_read", "exclude_archived"].includes(
      folderFlag,
    )
      ? /* html */ `
      <button class='button flag'>
        ${
          folder.flags[folderFlag]
            ? /* html */ `
              <img src="/img/svg/minus-black.svg" />
          `
            : /* html */ `
              <img src="/img/svg/minus-white.svg" />
          `
        }
      </button>`
      : /* html */ `
      <button class='button flag'>
        ${
          folder.flags[folderFlag]
            ? /* html */ `
              <img src="/img/svg/plus-black.svg" />
          `
            : /* html */ `
            <img src="/img/svg/plus-white.svg" />
          `
        }
      </button>`;
    return html;
  };

  /**
   * @method setChatRelation
   * @description Update chat-folder relation
   * @param {Event} event
   * @param {String} relation
   */
  setChatRelation = async (event, relation) => {
    event.innerHTML = `
      <div class="spinner">
        <div class="block"></div>
      </div>
    `;

    const tdElement = event.parentElement.parentElement;
    const trElement = event.parentElement.parentElement.parentElement;

    const folderId = tdElement.getAttribute("data-folder-id");
    const chatId = tdElement.getAttribute("data-chat-id");
    const chatIndex = trElement.getAttribute("data-chat-index");

    const response = await eel.set_chat_folder_relation(
      Number(chatId),
      Number(folderId),
      relation,
    )();

    if (response.success) {
      let imagePath = "";

      if (relation === "include") {
        imagePath = "/img/svg/plus-black.svg";
        event.classList.remove("null");
        event.classList.add("include");

        if (!this.chats[chatIndex].folders.include.includes(Number(folderId))) {
          this.chats[chatIndex].folders.include.push(Number(folderId));
        }
      } else if (relation === "pinned") {
        imagePath = "/img/svg/pin-black.svg";
        event.classList.remove("include");
        event.classList.add("pinned");

        const includeIndex = this.chats[chatIndex].folders.include.indexOf(
          Number(folderId),
        );
        if (includeIndex !== -1) {
          this.chats[chatIndex].folders.include.splice(includeIndex, 1);
        }
      } else if (relation === "exclude") {
        imagePath = "/img/svg/minus-black.svg";
        event.classList.remove("pinned");
        event.classList.add("exclude");

        const pinIndex = this.chats[chatIndex].folders.pinned.indexOf(
          Number(folderId),
        );
        if (pinIndex !== -1) {
          this.chats[chatIndex].folders.pinned.splice(pinIndex, 1);
        }
      } else if (relation === null) {
        imagePath = "/img/svg/plus-white.svg";
        event.classList.remove("exclude");
        event.classList.remove("pinned");
        event.classList.remove("include");
        event.classList.add("null");
      }

      event.innerHTML = `
        <img src="${imagePath}" />
      `;
    } else {
      event.innerHTML = `
        <img src="/img/svg/plus-white.svg" />
      `;
      if (response.error_code === "folder_empty_error") {
        const popup = new Popup(/* html */ `
          <div class='popup-content'>
            <h2>${i18n.t("error.occurred")}</h2>
            <p>${i18n.t("error.folder_empty")}</p>
            <div class='buttons'>
              <button id='popup-done'>${i18n.t("button.ok")}</button>
            </div>
          </div>
        `);
        popup.show();
        document
          .getElementById("popup-done")
          .addEventListener("click", () => popup.close(), { once: true });
      }
    }
    if (!response.success) {
      const text = response.error_code === "folder_empty_error"
        ? i18n.t("error.folder_empty")
        : i18n.t("error.occurred");
      const popupComponent = new Popup(/* html */ `
          <div class='popup-content'>
            <h2>${i18n.t("error.occurred")}</h2>
            <p>${text}</p>
            <div class='buttons'>
              <button id='popup-done'>${i18n.t("button.ok_upper")}</button>
            </div>
          </div>
        `);
      popupComponent.show();
      document
        .getElementById("popup-done")
        .addEventListener("click", () => popupComponent.close(), { once: true });
    }
  };

  /**
   * @method setFlagRelation
   * @description Update folder flags
   * @param {HTMLElement} event
   * @param {String} value
   */
  setFlagRelation = async (event) => {
    const flag = event.getAttribute("data-flag");
    const prevState = event.getAttribute("data-flag-state");
    const folderId = event.getAttribute("data-folder-id");

    const nextState =
      prevState === "true" || prevState === true ? false : true;

    const response = await eel.set_folder_flag(Number(folderId), flag, nextState)();
    if (response.success) {
      event.setAttribute("data-flag-state", String(nextState));
      const flagBtn = event.querySelector("button");
      const flagImg = event.querySelector("img");

      if (flag === "exclude_archived") {
        flagImg.src = nextState
          ? "/img/svg/minus-black.svg"
          : "/img/svg/minus-white.svg";
      } else if (flag === "exclude_muted") {
        flagImg.src = nextState
          ? "/img/svg/minus-black.svg"
          : "/img/svg/minus-white.svg";
      } else if (flag === "exclude_read") {
        flagImg.src = nextState
          ? "/img/svg/minus-black.svg"
          : "/img/svg/minus-white.svg";
      } else {
        flagImg.src = nextState
          ? "/img/svg/plus-black.svg"
          : "/img/svg/plus-white.svg";
      }
      flagBtn.innerHTML = `<img src="${flagImg.src}" />`;
    }

    if (!response.success) {
      const text = response.error_code === "folder_empty_error"
        ? i18n.t("error.folder_empty")
        : i18n.t("error.occurred");
      const popupComponent = new Popup(/* html */ `
          <div class='popup-content'>
            <h2>${i18n.t("error.occurred")}</h2>
            <p>${text}</p>
            <div class='buttons'>
              <button id='popup-done'>${i18n.t("button.ok_upper")}</button>
            </div>
          </div>
        `);
      popupComponent.show();
      document
        .getElementById("popup-done")
        .addEventListener("click", () => popupComponent.close(), { once: true });
    }
  };

  /**
   * @method setArchiveRelation
   * @description Toggle chat archive state
   * @param {Event} event
   */
  setArchiveRelation = async (event) => {
    const img = event.querySelector("img");
    img.remove();

    event.innerHTML = `
      <div class="spinner">
        <div class="block"></div>
      </div>
    `;

    let trElement = event.parentElement.parentElement.parentElement;
    let chatId = Number(trElement.getAttribute("data-chat-id"));
    let value = JSON.parse(trElement.getAttribute("data-archive-state"));

    let response = await eel.set_chat_archive(Number(chatId), !value)();

    let foundChatIndex = this.chats.findIndex((chat) => {
      return chat.chat_id === chatId;
    });

    this.chats[foundChatIndex].archived = response.current_value;
    trElement.setAttribute("data-archive-state", response.current_value);

    if (response.success) {
      value = response.current_value;
      let imagePath = "";
      if (value) {
        imagePath = "/img/svg/plus-black.svg";
      } else {
        imagePath = "/img/svg/plus-white.svg";
      }
      event.innerHTML = `
          <img src="${imagePath}" />
        `;
    } else {
      value = response.current_value;
      let imagePath = value
        ? "/img/svg/plus-black.svg"
        : "/img/svg/plus-white.svg";
      event.innerHTML = `
          <img src="${imagePath}" />
        `;
    }
  };

  /**
   * @method addFolder
   * @description Create and add a new folder (TODO)
   */
  addFolder() {}

  /**
   * @method updateChats
   * @description Refresh chats and folders data
   */
  async updateChats() {
    this.getData();
  }
}
