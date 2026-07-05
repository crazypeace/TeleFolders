# TeleFolders 功能差异报告

**项目**: crazypeace/TeleFolders  
**对比基线**: Noradrenalin-team/TeleFolders  
**报告日期**: 2026-07-04

---

## 新增功能

### 1. 命令行语言参数
- 启动时通过 `--lang en` 或 `--lang ru` 指定界面语言

### 2. 创建对话分组 Folder
- 界面 `+` 按钮弹出对话框，输入名称即可创建新的 Telegram 对话分组 Folder

### 3. CSV 导入 / 导出
- **导出**: 将所有聊天Dialog与对话分组Folder的关系导出为 CSV，采用「宽格式」——每行一个聊天，每列一个Folder。
- **导入**: 从 CSV 恢复Folder配置。只修改有变更的项，跳过不变的项，减少不必要的 API 调用
- **状态缩写**: CSV 中支持 `I`/`P`/`X`/`N` 缩写（对应 include/pinned/exclude/empty），大小写不敏感


----
以下为源项目 README

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

[🇺🇸 English](README.en.md) | [🇨🇳 中文](README.zh.md)

TeleFolders - это менеджер папок для управления чатами и каналами в Telegram

## Что можно делать с TeleFolders

- **Добавлять чаты в папки**: Легко добавляйте и удаляйте чаты и каналы из папок.
- **Закреплять чаты**: Важные чаты всегда будут под рукой.
- **Управлять флагами папок**: Можно, например, добавить все контакты или исключить все прочитанные из папки.
- **Синхронизировать папки**: Все изменения, сделанные в официальном клиенте Telegram, отражаются и в TeleFolders.
- **Простой интерфейс**: Интуитивно понятный интерфейс для управления папками и чатами.
- [***FUTURE***] **Создавать папки**: Группируйте чаты и каналы в удобные папки.
- [***FUTURE***] **Быстрый доступ**: Легкий и быстрый доступ к чатам и каналам из папок.

## Использование

![Скриншот](https://github.com/Noradrenalin-team/TeleFolders/raw/main/img/tf.jpg)
![Скриншот](https://github.com/Noradrenalin-team/TeleFolders/raw/main/img/tf2.jpg)

С помощью кнопок вы можете добавлять чаты в папки, закреплять чаты, а также исключать чаты из папок. У каждой папки есть возможность установить "флаги", например, в папку можно добавить все контакты или каналы, а также исключить прочитанные или чаты без уведомлений.

## Установка и запуск

### Использование исполняемого файла

1. Скачайте и запустите исполняемый файл для вашей операционной системы из раздела [релизов](https://github.com/Noradrenalin-team/TeleFolders/releases)

2. Запустите исполняемый файл

3. Войдите в свой аккаунт Telegram, используя номер телефона и код подтверждения

### Установка через pip

(ВАЖНО!) Необходимо использовать python 3.11

```bash
pip install telefolders
```

Запуск

```bash
python -m telefolders --api_id <api_id> --api_hash <api_hash>
```

### Запуск из исходного кода

1. Склонируйте репозиторий:

```bash
git clone https://github.com/Noradrenalin-team/TeleFolders

cd TeleFolders
```

2. Установите зависимости:

Через poetry (рекомендуется)

```bash
pip install poetry

poetry install
```

Через pip

```bash
pip install -r requirements.txt
```

3. Запустите приложение и передайте параметры клиента [Telegram](https://my.telegram.org) (api_id и api_hash):

```bash
poetry run -m telefolders --api_id <api_id> --api_hash <api_hash>
# Или
python -m telefolders --api_id <api_id> --api_hash <api_hash>
```

## Технологии

Этот проект был реализован с использованием языка программирования Python в сочетании с фреймворком Eel для создания веб-интерфейса приложения, а также библиотекой Telethon для взаимодействия с Telegram API.

## Сборка проекта

Для сборки проекта в исполняемый файл используется библиотека PyInstaller:

```bash
pyinstaller --noconfirm --onefile --windowed --add-data "telefolders:telefolders/"  "main.py"
```

## Участие в проекте

Мы приглашаем всех желающих принять участие в развитии проекта и сделать его еще лучше!

Вы можете посмотреть над чем можно поработать или внести своё предложение в [issues](https://github.com/Noradrenalin-team/TeleFolders/issues)

## Обсуждение проекта

Вы можете принять участие в обсуждении проекта или задать нам вопросы в [чате телеграм](https://t.me/+4iWgAed_aDYyMWEy)
