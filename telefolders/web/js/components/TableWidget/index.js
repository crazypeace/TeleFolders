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
    if (
      JSON.parse(localStorage.getItem("archiveState")) === null ||
      JSON.parse(localStorage.getItem("archiveState")) === undefined
    ) {
      localStorage.setItem("archiveState", true);
    }
    this.archiveState =
      JSON.parse(localStorage.getItem("archiveState")) === true;

    if (!Table.instance) {
      Table.instance = this;
    }

    return Table.instance;
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

    console.log("chats count: ", this.chats.length);
    console.log("chats: ", this.chats);
    console.log("folders count: ", this.folders.length);
    console.log("folders: ", this.folders);

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
    const table = this; // capture Table instance

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
   * @method drawChats
   * @description Draw chat table
   */
  async drawChats() {
    const chats = this.chats;
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
      const archiveState =
        localStorage.getItem("archiveState") === "true" ? true : false;

      const imagePath = value.archived
        ? "/img/svg/plus-black.svg"
        : "/img/svg/plus-white.svg";

      if (!archiveState) {
        if (value.archived) {
        } else {
          html += /* html */ `
                <tr
                  data-chat-index="${index}"
                  data-archive-state="${value.archived}"
                  data-chat-id="${value.chat_id}"
                >
                  <th
                    data-chat-id="${value.chat_id}"
                    class="th title"
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
        }
      } else {
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
      }
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
    // Find the actual button if user clicked img inside it
    const button = event.target.closest("button");
    const target = button || event.target;
    console.log("[handleClick] target:", target.className, "button:", button?.className, "event.target:", event.target.className);
    
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

        if (!this.chats[chatIndex].folders.pinned.includes(Number(folderId))) {
          this.chats[chatIndex].folders.pinned.push(Number(folderId));
        }
      } else if (relation === "exclude") {
        imagePath = "/img/svg/minus-black.svg";
        event.classList.remove("pinned");
        event.classList.add("exclude");

        const pinnedIndex = this.chats[chatIndex].folders.pinned.indexOf(
          Number(folderId),
        );
        if (pinnedIndex !== -1) {
          this.chats[chatIndex].folders.pinned.splice(pinnedIndex, 1);
        }

        if (!this.chats[chatIndex].folders.exclude.includes(Number(folderId))) {
          this.chats[chatIndex].folders.exclude.push(Number(folderId));
        }
      } else if (relation === null) {
        imagePath = "/img/svg/plus-white.svg";
        event.classList.remove("exclude");
        event.classList.add("null");

        const excludeIndex = this.chats[chatIndex].folders.exclude.indexOf(
          Number(folderId),
        );
        if (excludeIndex !== -1) {
          this.chats[chatIndex].folders.exclude.splice(excludeIndex, 1);
        }
      }

      event.innerHTML = `
        <img src='${imagePath}' />
      `;
    }
    if (!response.success) {
      const text =
        response.error_code === "folder_empty_error"
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

      function addFolderHandler() {
        popupComponent.close();
      }

      document
        .getElementById("popup-done")
        .addEventListener("click", addFolderHandler, { once: true });
    }
  };

  /**
   * @method setFlagRelation
   * @description Toggle folder flag
   * @param {Event} event
   */
  setFlagRelation = async (event) => {
    event.innerHTML = `
    <div class="buttons flug">
      <div class="spinner">
        <div class="block"></div>
      </div>
    </div>
    `;

    let folderId = event.getAttribute("data-folder-id");
    let flag = event.getAttribute("data-flag");
    let value = JSON.parse(event.getAttribute("data-flag-state"));
    let response = await eel.set_folder_flag(Number(folderId), flag, !value)();

    if (response.success === true) {
      event.setAttribute("data-flag-state", !value);
      let html = [
        "exclude_muted",
        "exclude_read",
        "exclude_archived",
      ].includes(flag);

      if (value) {
        if (html) {
          event.innerHTML = /* html */ `
          <div class='buttons flag'>
            <button class='button flag'>
              <img src="/img/svg/minus-white.svg" />
            </button>
          </div>
        `;
        } else {
          event.innerHTML = /* html */ `
          <div class='buttons flag'>
            <button class='button flag'>
              <img src="/img/svg/plus-white.svg" />
            </button>
          </div>
          `;
        }
      } else {
        if (html) {
          event.innerHTML = /* html */ `
          <div class='buttons flag'>
            <button class='button flag'>
              <img src="/img/svg/minus-black.svg" />
            </button>
          </div>
        `;
        } else {
          event.innerHTML = /* html */ `
          <div class='buttons flag'>
            <button class='button flag'>
              <img src="/img/svg/plus-black.svg" />
            </button>
          </div>
        `;
        }
      }
    }

    if (!response.success) {
      const text =
        response.error_code === "folder_empty_error"
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

      function addFolderHandler() {
        popupComponent.close();
      }

      document
        .getElementById("popup-done")
        .addEventListener("click", addFolderHandler, { once: true });
    }
  };

  /**
   * @method setArchiveRelation
   * @description Toggle chat archive state
   * @param {Event} event
   */
  setArchiveRelation = async (event) => {
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

    if (response.success) {
      value = response.current_value;
      this.chats[foundChatIndex].archived = value;
      trElement.setAttribute("data-archive-state", value);
      let imagePath = "";

      if (value) {
        imagePath = "/img/svg/plus-black.svg";
      } else {
        imagePath = "/img/svg/plus-white.svg";
      }

      if (value && !this.archiveState) {
        trElement.style.display = "none";
      }

      event.innerHTML = /* html */ `
          <img src="${imagePath}" />
        `;
    } else {
      value = response.current_value;
      this.chats[foundChatIndex].archived = value;
      trElement.setAttribute("data-archive-state", value);
      let imagePath = value
        ? "/img/svg/plus-black.svg"
        : "/img/svg/plus-white.svg";
      event.innerHTML = /* html */ `
          <img src="${imagePath}" />
        `;
    }
  };

  /**
   * @method showArchive
   * @description Show archived chats
   */
  showArchive = () => {
    localStorage.setItem("archiveState", true);
    this.archiveState = true;
    this.drawChats();
  };

  /**
   * @method hideArchive
   * @description Hide archived chats
   */
  hideArchive = () => {
    localStorage.setItem("archiveState", false);
    this.archiveState = false;
    this.drawChats();
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
