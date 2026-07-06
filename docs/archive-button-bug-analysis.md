# Favorites 行 Archive 按钮点击转圈问题分析

## 现象

点击 chat = Favorites（chat_id = `6610601789`）行的 Archive 列按钮，图标一直转圈（spinner 无限旋转）。

## 根因

### DOM 结构对比

Favorites 行的 HTML 结构如下：

```html
<tr data-chat-id="6610601789">           ← <tr> 有 data-chat-id
  <th data-chat-id="6610601789">          ← <th> 行头，有 data-chat-id
    Favorites
  </th>

  <td>                                     ← Archive 列：❌ 无 data-chat-id
    <div class="buttons">
      <button class="button archive">
        <img src="/img/svg/plus-white.svg"/>
      </button>
    </div>
  </td>

  <td data-chat-id="6610601789"           ← Archive 文件夹列：✅ 有 data-chat-id
      data-folder-id="2">
    <div class="buttons">
      <button class="button null">...</button>
    </div>
  </td>

  <td data-chat-id="6610601789"           ← Unread 文件夹列：✅ 有 data-chat-id
      data-folder-id="3">
    <button class="button null">...</button>
  </td>

  ... 其他文件夹列 ...
</tr>
```

**关键差异**：Archive 列的 `<td>` 缺少 `data-chat-id` 属性，而所有文件夹列都有。

### 代码对比

**渲染代码**（`drawChats`，TableWidget/index.js 第 360–406 行）：

```javascript
// Archive 列 —— 没有 data-chat-id
html += `
  <td>
    <div class="buttons">
      <button class="button archive">
        <img src="${imagePath}"/>
      </button>
    </div>
  </td>
`;

// 文件夹列 —— 有 data-chat-id 和 data-folder-id
${folders.map((folder) => {
  return `
    <td
      data-chat-id="${value.chat_id}"
      data-folder-id="${folder.folder_id}"
    >
      <div class="buttons">
        ${this.setChatsButtons(folder.folder_id, value)}
      </div>
    </td>
  `;
}).join("")}
```

**点击处理代码**：

```javascript
// Archive 列（第 674–711 行）
setArchiveRelation(target) {
  const tdElement = target.parentElement.parentElement;  → Archive 列 <td>
  const trElement = tdElement.parentElement;             → <tr>

  const chatId = tdElement.getAttribute("data-chat-id"); → null ❌
  //                    ^^^^^^^^^^^^
  //                    Archive 列 TD 没有 data-chat-id！

  const response = await eel.set_chat_archive(null, true)(); → 后端挂住不返回
}

// 文件夹列（第 540–625 行）
setChatRelation(target, relation) {
  const tdElement = target.parentElement.parentElement;  → 文件夹列 <td>
  const trElement = tdElement.parentElement;             → <tr>

  const chatId = tdElement.getAttribute("data-chat-id"); → "6610601789" ✅
  const response = await eel.set_chat_folder_relation(
    Number(chatId), Number(folderId), relation
  )(); → 正常工作
}
```

### 不同列对比结论

| 按钮位置 | data-chat-id | 点击函数 | 后端调用 | 结果 |
|---|---|---|---|---|
| Archive 列 | **null** | `setArchiveRelation` | `set_chat_archive(null, ...)` | ❌ 转圈 |
| 文件夹列 | **"6610601789"** | `setChatRelation` | `set_chat_folder_relation(6610601789, ...)` | ✅ 正常 |

## 修复方案

### 方案 1（推荐，最小改动）

修改第 687 行，从 `<tr>` 而非 `<td>` 获取 `data-chat-id`：

```javascript
// 改前
const chatId = tdElement.getAttribute("data-chat-id");

// 改后
const chatId = trElement.getAttribute("data-chat-id");
```

### 方案 2

改用内部数据数组（`chatIndex` 始终能正确获取）：

```javascript
const chatId = this.chats[chatIndex].chat_id;
```

## 文件信息

- 项目：`TeleFolders`
- 问题文件：`telefolders/web/js/components/TableWidget/index.js`
- 代码行：674–711（`setArchiveRelation`），360–406（`drawChats`）
- 状态：df11dcf commit，待修复
