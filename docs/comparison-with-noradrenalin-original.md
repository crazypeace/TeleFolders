# Noradrenalin 原始版本 vs df11dcf 版本对比分析

## 分析目标

按照 `docs/archive-button-bug-analysis.md` 的结论，检查 [Noradrenalin-team/TeleFolders](https://github.com/Noradrenalin-team/TeleFolders) 原始版本是否存在同样的 Archive 按钮点击转圈问题。

## 对比结果

### Noradrenalin 原始版本（第 694-713 行）

```javascript
setArchiveRelation = async (event) => {
    // add spinner
    event.innerHTML = `<div class="spinner">...</div>`;

    let trElement = event.parentElement.parentElement.parentElement;  // ← 指向 <tr>
    let chatId = Number(trElement.getAttribute("data-chat-id"));       // ← 从 <tr> 获取 ✅
    let value = JSON.parse(trElement.getAttribute("data-archive-state")); // ← 从 <tr> 获取 ✅

    let response = await eel.set_chat_archive(Number(chatId), !value)();

    // ...更新 UI
};
```

### 我们当前版本 df11dcf（第 674-693 行）

```javascript
setArchiveRelation = async (target) => {
    target.innerHTML = `<div class="spinner">...</div>`;

    const tdElement = target.parentElement.parentElement;  // ← 指向 <td>
    const trElement = tdElement.parentElement;             // ← 指向 <tr>

    const chatId = tdElement.getAttribute("data-chat-id"); // ← 从 <td> 获取 ❌
    const chatIndex = trElement.getAttribute("data-chat-index");

    const currentState = this.chats[chatIndex].archived;
    const newState = !currentState;

    const response = await eel.set_chat_archive(chatId, newState)(); // ← chatId 为 null
};
```

## 关键差异表

| 项目 | Noradrenalin 原始版本 | df11dcf 版本 |
|---|---|---|
| **chatId 获取来源** | `trElement.getAttribute("data-chat-id")` ✅ | `tdElement.getAttribute("data-chat-id")` ❌ |
| **chatId 类型转换** | `Number(...)` ✅ | 无（字符串）❌ |
| **archive state 来源** | `trElement.getAttribute("data-archive-state")` ✅ | `this.chats[chatIndex].archived` |
| **Archive 列 `<td>` 有 `data-chat-id`？** | 没有 | 没有 |
| **点击 Archive 列按钮结果** | ✅ **正常工作** | ❌ **无限转圈** |

## 根因定位

**Noradrenalin 原始版本没有这个问题**，因为它从 `<tr>` 行元素获取 `data-chat-id`。即使 Archive 列的 `<td>` 没有 `data-chat-id`，`<tr>` 始终有该属性，所以能正确工作。

我们的 df11dcf 版本是从 `<td>` 获取 `data-chat-id`。Archive 列的 `<td>` 没有这个属性（渲染时没添加），导致：
- `chatId = null`
- 后端 `set_chat_archive(null, true)` 永远不返回
- 前端 spinner 无限旋转

## 修复方案（已验证与原始版本一致）

将 df11dcf 版本的第 687 行：

```javascript
// 改前（从 <td> 获取 → null）
const chatId = tdElement.getAttribute("data-chat-id");

// 改后（从 <tr> 获取 → 正确值）
const chatId = trElement.getAttribute("data-chat-id");
```

这与 Noradrenalin 原始版本的写法完全一致。

## 结论

- ✅ **Noradrenalin 原始版本**：没有这个 bug。`chatId` 和 `archiveState` 都从 `<tr>` 获取
- ❌ **df11dcf 版本**：有这个 bug。`chatId` 从 `<td>` 获取（Archive 列为 null），类型也没转 `Number()`
- 🔧 **修复**：1 行改动，从 `trElement` 读取 `data-chat-id`
