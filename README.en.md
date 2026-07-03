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

TeleFolders is a folder manager for organizing chats and channels in Telegram.

## What You Can Do with TeleFolders

- **Add chats to folders**: Easily add and remove chats and channels from folders.
- **Pin chats**: Keep important chats always within reach.
- **Manage folder flags**: For example, add all contacts to a folder or exclude all read chats.
- **Synchronize folders**: All changes made in the official Telegram client are reflected in TeleFolders.
- **Simple interface**: Intuitive interface for managing folders and chats.
- [***FUTURE***] **Create folders**: Group chats and channels into convenient folders.
- [***FUTURE***] **Quick access**: Easy and fast access to chats and channels from folders.

## Usage

![Screenshot](https://github.com/Noradrenalin-team/TeleFolders/raw/main/img/tf.jpg)
![Screenshot](https://github.com/Noradrenalin-team/TeleFolders/raw/main/img/tf2.jpg)

Using the buttons, you can add chats to folders, pin chats, and exclude chats from folders. Each folder has the ability to set "flags" — for example, you can add all contacts or channels to a folder, as well as exclude read chats or chats without notifications.

## Installation and Running

### Using the Executable

1. Download and run the executable for your operating system from the [releases](https://github.com/Noradrenalin-team/TeleFolders/releases) section.
2. Run the executable.
3. Log in to your Telegram account using your phone number and verification code.

### Installing via pip

(IMPORTANT!) Python 3.11 is required.

```bash
pip install telefolders
```

Running

```bash
python -m telefolders --api_id <api_id> --api_hash <api_hash>
```

### Running from Source Code

1. Clone the repository:

```bash
git clone https://github.com/Noradrenalin-team/TeleFolders
cd TeleFolders
```

2. Install dependencies:

Using poetry (recommended)

```bash
pip install poetry
poetry install
```

Using pip

```bash
pip install -r requirements.txt
```

3. Run the application and pass the [Telegram](https://my.telegram.org) client parameters (api_id and api_hash):

```bash
poetry run -m telefolders --api_id <api_id> --api_hash <api_hash>
# Or
python -m telefolders --api_id <api_id> --api_hash <api_hash>
```

## Technologies

This project was implemented using the Python programming language in combination with the Eel framework for creating the application's web interface, as well as the Telethon library for interacting with the Telegram API.

## Building the Project

To build the project into an executable, the PyInstaller library is used:

```bash
pyinstaller --noconfirm --onefile --windowed --add-data "telefolders:telefolders/"  "main.py"
```

## Contributing

We invite everyone to participate in the development of the project and make it even better!

You can see what to work on or submit your suggestions in [issues](https://github.com/Noradrenalin-team/TeleFolders/issues).

## Discussion

You can participate in the project discussion or ask us questions in the [Telegram chat](https://t.me/+4iWgAed_aDYyMWEy).
