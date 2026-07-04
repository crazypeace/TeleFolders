import os
import eel

from .tg import Telefolders


telefolders = Telefolders()


@eel.expose
def init():
    return telefolders.init()


@eel.expose
def login_phone(phone):
    return telefolders.login_phone(phone)


@eel.expose
def login_code(phone, code):
    return telefolders.login_code(phone, code)


@eel.expose
def login_password(phone, password, phone_code_hash):
    return telefolders.login_password(phone, password, phone_code_hash)


@eel.expose
def set_chat_archive(chat_id, archive):
    print(chat_id, archive)
    return telefolders.set_chat_archive(chat_id, archive)


@eel.expose
def logout():
    return telefolders.logout()


@eel.expose
def get_user():
    return telefolders.get_user()


@eel.expose
def get_folders():
    import sys
    result = telefolders.get_folders()
    print(f"[eel] get_folders returned {len(result)} items", file=sys.stderr, flush=True)
    return result


@eel.expose
def get_all_chats():
    import sys
    result = telefolders.get_all_chats()
    print(f"[eel] get_all_chats returned {len(result)} items", file=sys.stderr, flush=True)
    return result


@eel.expose
def set_chat_pin(chat_id, pin):
    return telefolders.set_chat_pin(chat_id, pin)


@eel.expose
def set_chat_folder_relation(chat_id, folder_id, relation=None):
    return telefolders.set_chat_folder_relation(chat_id, folder_id, relation)


@eel.expose
def set_folder_flag(folder_id, flag, value):
    return telefolders.set_folder_flag(folder_id, flag, value)


@eel.expose
def export_csv():
    return telefolders.export_csv()


@eel.expose
def import_csv(csv_string, force=False):
    return telefolders.import_csv(csv_string, force)


@eel.expose
def create_folder(title):
    return telefolders.create_folder(title)


@eel.expose
def get_language():
    return os.environ.get("TELEFOLDERS_LANG", "en")

