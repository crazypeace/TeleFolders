# TeleFolders

![GitHub License](https://img.shields.io/github/license/Noradrenalin-team/TeleFolders)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/Noradrenalin-team/TeleFolders/total)
![GitHub Release](https://img.shields.io/github/v/release/Noradrenalin-team/TeleFolders)
![GitHub Release Date](https://img.shields.io/github/release-date/Noradrenalin-team/TeleFolders)
![GitHub commits since latest release](https://img.shields.io/github/commits-since/Noradrenalin-team/TeleFolders/latest)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Noradrenalin-team/TeleFolders)
![GitHub last commit](https://img.shields.io/github/last-commit/Noradrenalin-team/TeleFolders)<!-- ![GitHub contributors from allcontributors.org](https://img.shields.io/github/all-contributors/Noradrenalin-team/TeleFolders) -->
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/Noradrenalin-team/TeleFolders)
![GitHub Repo stars](https://img.shields.io/github/stars/Noradrenalin-team/TeleFolders)

TeleFolders 是一个用于管理 Telegram 聊天和频道文件夹的工具。

## 功能特性

- **添加聊天到文件夹**：轻松将聊天和频道添加或移出文件夹。
- **固定聊天**：重要聊天始终触手可及。
- **管理文件夹标志**：例如，可将所有联系人添加到文件夹，或排除所有已读聊天。
- **同步文件夹**：在官方 Telegram 客户端中所做的更改会同步反映到 TeleFolders 中。
- **简洁界面**：直观易用的文件夹和聊天管理界面。
- [***计划中***] **创建文件夹**：将聊天和频道分组到自定义文件夹中。
- [***计划中***] **快速访问**：从文件夹中快速便捷地访问聊天和频道。

## 使用说明

![截图](https://github.com/Noradrenalin-team/TeleFolders/raw/main/img/tf.jpg)
![截图](https://github.com/Noradrenalin-team/TeleFolders/raw/main/img/tf2.jpg)

通过按钮，您可以将聊天添加到文件夹、固定聊天以及从文件夹中排除聊天。每个文件夹都可以设置"标志"——例如，可以将所有联系人或频道添加到文件夹中，也可以排除已读聊天或没有通知的聊天。

## 安装与运行

### 使用可执行文件

1. 从 [Releases](https://github.com/Noradrenalin-team/TeleFolders/releases) 页面下载并运行适用于您操作系统的可执行文件。
2. 运行可执行文件。
3. 使用手机号和验证码登录您的 Telegram 账号。

### 通过 pip 安装

(重要！) 需要使用 Python 3.11。

```bash
pip install telefolders
```

运行

```bash
python -m telefolders --api_id <api_id> --api_hash <api_hash>
```

### 从源码运行

1. 克隆仓库：

```bash
git clone https://github.com/Noradrenalin-team/TeleFolders
cd TeleFolders
```

2. 安装依赖：

使用 poetry（推荐）

```bash
pip install poetry
poetry install
```

使用 pip

```bash
pip install -r requirements.txt
```

3. 运行应用并传入 [Telegram](https://my.telegram.org) 客户端参数（api_id 和 api_hash）：

```bash
poetry run -m telefolders --api_id <api_id> --api_hash <api_hash>
# 或者
python -m telefolders --api_id <api_id> --api_hash <api_hash>
```

## 技术栈

本项目使用 Python 语言实现，结合 Eel 框架构建应用 Web 界面，使用 Telethon 库与 Telegram API 进行交互。

## 项目打包

使用 PyInstaller 将项目打包为可执行文件：

```bash
pyinstaller --noconfirm --onefile --windowed --add-data "telefolders:telefolders/"  "main.py"
```

## 参与贡献

我们欢迎所有人参与项目开发，让它变得更好！

您可以在 [Issues](https://github.com/Noradrenalin-team/TeleFolders/issues) 中查看可参与的工作或提交您的建议。

## 项目讨论

您可以在 [Telegram 群组](https://t.me/+4iWgAed_aDYyMWEy) 中参与项目讨论或向我们提问。
