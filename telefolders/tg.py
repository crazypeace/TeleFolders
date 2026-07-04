import telethon
from telethon import TelegramClient, sync  # noqa
from telethon.tl.functions.messages import GetDialogFiltersRequest
from telethon.tl.functions.messages import UpdateDialogFilterRequest
from telethon import errors
from telethon.tl.types import DialogFilter, TextWithEntities, InputPeerUser, InputPeerChat, InputPeerChannel

import os

def _extract_title(title):
    """Extract plain text from Telethon's TextWithEntities or return string as-is."""
    if hasattr(title, 'text'):
        return title.text
    return str(title) if title else ''

class Telefolders:
    def __init__(self):
        self.client: TelegramClient = None

    def init(self):

        if not self.client:
            # from https://my.telegram.org, under API Development.
            api_id = os.environ.get("TELEFOLDERS_API_ID")
            api_hash = os.environ.get("TELEFOLDERS_API_HASH")

            try:
                self.client = TelegramClient(
                    os.path.join(
                        os.path.dirname(os.path.realpath(__file__)), "telefolders"
                    ),
                    api_id,
                    api_hash,
                    lang_code=os.environ.get("TELEFOLDERS_LANG", "ru"),
                )
                self.client.connect()

                if self.client.is_user_authorized():
                    return {"success": True, "authorized": True}
                else:
                    return {"success": True, "authorized": False}
            except Exception as e:
                return {"success": False, "error": str(e), "error_code": "unknown"}

        if self.client.is_user_authorized():
            return {"success": True, "authorized": True}
        else:
            return {"success": True, "authorized": False}

    def login_phone(self, phone):
        try:
            print(phone)
            r = self.client.send_code_request(phone)
            return {"success": True, "phone_code_hash": r.phone_code_hash}
        except Exception as e:
            return {"success": False, "error": str(e), "error_code": "unknown"}

    def login_code(self, phone, code):
        try:
            print(phone, code)
            self.client.sign_in(phone, code)
            return {"success": True, "need_password": False, "user": self.get_user()}
        except errors.rpcerrorlist.SessionPasswordNeededError:
            return {
                "success": True,
                "need_password": True,
                "user": None,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "need_password": False,
                "error_code": "unknown",
            }

    def login_password(self, phone, password, phone_code_hash):
        try:
            print(phone, password, phone_code_hash)
            self.client.sign_in(
                phone, password=password, phone_code_hash=phone_code_hash
            )
            return {"success": True, "user": self.get_user()}

        except Exception as e:
            return {"success": False, "error": str(e), "error_code": "unknown"}

    def logout(self):
        try:
            self.client.log_out()
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e), "error_code": "unknown"}

    def get_user(self):
        me = self.client.get_me()
        return (
            {
                "username": me.username,
                "first_name": me.first_name,
                "last_name": me.last_name,
                # "picture": self.client.download_profile_photo("me", file=bytes),
                "id": me.id,
            }
            if self.client.is_user_authorized()
            else None
        )

    def get_folders(self):
        try:
            result = self.client(GetDialogFiltersRequest())
            folders = result.filters if hasattr(result, 'filters') else result
        except Exception as e:
            print(f"[get_folders] ERROR: {e}", flush=True)
            return []

        ans = []

        for folder in folders:
            if type(folder) == DialogFilter:
                ans.append(
                    {
                        "folder_id": folder.id,
                        "folder_title": _extract_title(folder.title),
                        "folder_icon": folder.emoticon,
                        "flags": {
                            "contacts": folder.contacts,
                            "non_contacts": folder.non_contacts,
                            "groups": folder.groups,
                            "broadcasts": folder.broadcasts,
                            "bots": folder.bots,
                            "exclude_muted": folder.exclude_muted,
                            "exclude_read": folder.exclude_read,
                            "exclude_archived": folder.exclude_archived,
                        },
                    }
                )

        return ans

    def get_all_chats(self):
        chats_with_folders = {}
        try:
            result = self.client(GetDialogFiltersRequest())
            all_folders = result.filters if hasattr(result, 'filters') else result
        except Exception as e:
            print(f"[get_all_chats] ERROR getting filters: {e}", flush=True)
            all_folders = []

        for folder in all_folders:
            if type(folder) == DialogFilter:
                include_chats = folder.include_peers
                exclude_chats = folder.exclude_peers
                pinned_chats = folder.pinned_peers

                for chat in include_chats:
                    if "channel_id" in chat.__dict__:
                        chat_id = chat.channel_id
                    elif "user_id" in chat.__dict__:
                        chat_id = chat.user_id
                    elif "chat_id" in chat.__dict__:
                        chat_id = chat.chat_id
                    else:
                        print(chat)
                        continue
                    if chat_id not in chats_with_folders:
                        chats_with_folders[chat_id] = {
                            "include": [],
                            "exclude": [],
                            "pinned": [],
                        }
                    chats_with_folders[chat_id]["include"].append(folder.id)

                for chat in exclude_chats:
                    if "channel_id" in chat.__dict__:
                        chat_id = chat.channel_id
                    elif "user_id" in chat.__dict__:
                        chat_id = chat.user_id
                    elif "chat_id" in chat.__dict__:
                        chat_id = chat.chat_id
                    else:
                        print(chat)
                        continue
                    if chat_id not in chats_with_folders:
                        chats_with_folders[chat_id] = {
                            "include": [],
                            "exclude": [],
                            "pinned": [],
                        }
                    chats_with_folders[chat_id]["exclude"].append(folder.id)

                for chat in pinned_chats:
                    if "channel_id" in chat.__dict__:
                        chat_id = chat.channel_id
                    elif "user_id" in chat.__dict__:
                        chat_id = chat.user_id
                    elif "chat_id" in chat.__dict__:
                        chat_id = chat.chat_id
                    else:
                        print(chat)
                        continue
                    if chat_id not in chats_with_folders:
                        chats_with_folders[chat_id] = {
                            "include": [],
                            "exclude": [],
                            "pinned": [],
                        }
                    chats_with_folders[chat_id]["pinned"].append(folder.id)

        # Get contacts list for classification
        contacts_ids = set()
        try:
            contacts = self.client.get_contacts()
            contacts_ids = {c.id for c in contacts}
        except Exception as e:
            print(f"[get_all_chats] ERROR getting contacts: {e}", flush=True)

        ans = []

        try:
            for chat in self.client.iter_dialogs():
                peer_id = chat.entity.id
                entity = chat.entity

                # Classify entity
                is_bot = getattr(entity, 'bot', False)
                is_broadcast = getattr(entity, 'broadcast', False)
                is_megagroup = getattr(entity, 'megagroup', False)
                is_gigagroup = getattr(entity, 'gigagroup', False)

                is_group = (is_megagroup or is_gigagroup) and not is_broadcast
                is_channel = is_broadcast
                is_private_user = not is_bot and not is_group and not is_channel

                is_contact = peer_id in contacts_ids if is_private_user else False
                is_non_contact = is_private_user and not is_contact

                # Muted status
                mute_until = getattr(chat.dialog.notify_settings, 'mute_until', None)
                is_muted = mute_until is not None

                # Unread count
                unread_count = getattr(chat.dialog, 'unread_count', 0) or 0
                is_read = unread_count == 0

                archived = chat.archived
                if chat.id == 777000 or chat.title == "Telegram":
                    print(f"[get_all_chats] chat_id={chat.id}, title={chat.title!r}, archived={archived}", flush=True)

                ans.append(
                    {
                        "chat_id": chat.id,
                        "peer_id": peer_id,
                        "pinned": chat.pinned,
                        "title": chat.title,
                        "archived": archived,
                        "is_contact": is_contact,
                        "is_non_contact": is_non_contact,
                        "is_group": is_group,
                        "is_channel": is_channel,
                        "is_bot": is_bot,
                        "is_muted": is_muted,
                        "is_read": is_read,
                        "folders": chats_with_folders.get(
                            peer_id, {"include": [], "exclude": [], "pinned": []}
                        ),
                    }
                )
        except Exception as e:
            print(f"[get_all_chats] ERROR iterating dialogs: {e}", flush=True)
        return ans

    def set_chat_pin(self, chat_id, pin: bool = True):
        return {
            "success": False,
            "error": "Not implemented yet",
            "error_code": "not_implemented",
        }

    def set_chat_archive(self, chat_id, archive: bool = True):
        if archive:
            self.client.edit_folder(chat_id, 1)
        else:
            self.client.edit_folder(chat_id, 0)

        # Query actual server state to confirm the operation took effect.
        actual = None
        try:
            for chat in self.client.iter_dialogs():
                if chat.id == chat_id:
                    actual = chat.archived
                    break
        except Exception:
            pass

        print(f"[{chat_id}] requested archive={archive}, actual={actual}")

        if actual is None:
            return {"success": True, "current_value": archive}

        return {
            "success": bool(actual) == archive,
            "current_value": bool(actual),
        }

    def set_chat_folder_relation(self, chat_id, folder_id, relation=None):
        result = self.client(GetDialogFiltersRequest())
        folders = result.filters if hasattr(result, 'filters') else result

        for folder_ in folders:
            if "id" in folder_.__dict__ and folder_.id == folder_id:
                folder = folder_
                break

        entity = self.client.get_input_entity(
            telethon.utils.get_peer(self.client.get_entity(chat_id))
        )

        if relation == "include":
            if entity in folder.exclude_peers:
                folder.exclude_peers.remove(entity)
            if entity in folder.pinned_peers:
                folder.pinned_peers.remove(entity)
            folder.include_peers.append(entity)
        elif relation == "exclude":
            if entity in folder.include_peers:
                folder.include_peers.remove(entity)
            if entity in folder.pinned_peers:
                folder.pinned_peers.remove(entity)
            folder.exclude_peers.append(entity)
        elif relation == "pinned":
            if entity in folder.include_peers:
                folder.include_peers.remove(entity)
            if entity in folder.exclude_peers:
                folder.exclude_peers.remove(entity)
            folder.pinned_peers.append(entity)
        else:
            if entity in folder.include_peers:
                folder.include_peers.remove(entity)
            if entity in folder.exclude_peers:
                folder.exclude_peers.remove(entity)

        try:
            self.client(UpdateDialogFilterRequest(folder.id, folder))
        except telethon.errors.rpcerrorlist.FilterIncludeEmptyError:
            return {
                "success": False,
                "error": "The include_peers vector of the filter is empty",
                "error_code": "folder_empty_error",
            }
        return {"success": True}

    def create_folder(self, title):
        try:
            # Get existing folders to determine the next ID
            result = self.client(GetDialogFiltersRequest())
            existing = result.filters if hasattr(result, 'filters') else result

            # Find max folder id to generate a new one
            max_id = 1
            for f in existing:
                if hasattr(f, 'id') and f.id >= max_id:
                    max_id = f.id + 1

            # Get one chat to include (Telegram requires at least one filter criterion)
            chats = self.get_all_chats()
            include_peers = []
            if chats:
                chat = chats[0]
                try:
                    if chat.get('type') == 'user':
                        include_peers.append(InputPeerUser(user_id=chat['id'], access_hash=chat.get('access_hash', 0)))
                    elif chat.get('type') == 'chat':
                        include_peers.append(InputPeerChat(chat_id=chat['id']))
                    elif chat.get('type') == 'channel':
                        include_peers.append(InputPeerChannel(channel_id=chat['id'], access_hash=chat.get('access_hash', 0)))
                except:
                    pass

            # Create new DialogFilter
            new_filter = DialogFilter(
                id=max_id,
                title=TextWithEntities(text=title, entities=[]),
                pinned_peers=[],
                include_peers=[],
                exclude_peers=[],
                contacts=True,
                non_contacts=False,
                groups=False,
                broadcasts=False,
                bots=False,
                exclude_muted=False,
                exclude_read=False,
                exclude_archived=False,
            )

            self.client(UpdateDialogFilterRequest(max_id, new_filter))
            return {"success": True, "folder_id": max_id, "title": title}
        except Exception as e:
            return {"success": False, "error": str(e), "error_code": "unknown"}

    def export_csv(self):
        import csv, io
        folders_data = self.get_folders()
        chats = self.get_all_chats()

        output = io.StringIO()
        writer = csv.writer(output)

        folder_titles = [f["folder_title"] for f in folders_data]

        # Header: chat_id, chat_name, folder1, folder2, ...
        header = ["chat_id", "chat_name"] + folder_titles
        writer.writerow(header)

        # Chat rows only
        for chat in chats:
            row = [chat["chat_id"], chat["title"]]

            chat_folders = chat.get("folders", {})
            for f in folders_data:
                fid = f["folder_id"]
                if fid in chat_folders.get("include", []):
                    row.append("include")
                elif fid in chat_folders.get("pinned", []):
                    row.append("pinned")
                elif fid in chat_folders.get("exclude", []):
                    row.append("exclude")
                else:
                    row.append("empty")
            writer.writerow(row)

        return {"success": True, "csv": output.getvalue()}

    def import_csv(self, csv_string, force=False):
        import csv, io

        # ---- 1. Validate CSV structure ----
        reader = csv.reader(io.StringIO(csv_string))
        rows = list(reader)

        if len(rows) < 1:
            return {"success": False, "error": "Empty CSV"}

        header = rows[0]
        csv_folder_titles = header[2:]

        # ---- 2. Get current server state ----
        result = self.client(GetDialogFiltersRequest())
        folders = result.filters if hasattr(result, 'filters') else result
        folders = [f for f in folders if type(f) == DialogFilter and hasattr(f, 'id')]
        current_titles = [_extract_title(f.title) for f in folders]

        # Build current-state map: {abs_chat_id: {folder_id: relation_str}}
        # 统一用 abs(channel_id) 作为 key，兼容 CSV 里的负数 chat_id
        current_state = {}
        for folder_ in folders:
            fid = folder_.id
            for key in ("include_peers", "pinned_peers", "exclude_peers"):
                for pe in getattr(folder_, key, []):
                    cid = getattr(pe, "channel_id", None) or getattr(pe, "user_id", None) or getattr(pe, "chat_id", None)
                    if cid:
                        abs_cid = abs(cid)
                        rel = "include" if key == "include_peers" else ("pinned" if key == "pinned_peers" else "exclude")
                        current_state.setdefault(abs_cid, {})[fid] = rel

        # ---- 3. Folder count validation ----
        if len(csv_folder_titles) != len(current_titles):
            return {
                "success": False,
                "error": f"CSV has {len(csv_folder_titles)} folders but account has {len(current_titles)}",
                "validation": {
                    "count_match": False,
                    "order_match": False,
                    "csv_titles": csv_folder_titles,
                    "current_titles": current_titles,
                }
            }

        # ---- 4. Folder order validation ----
        order_match = all(a == b for a, b in zip(csv_folder_titles, current_titles))

        if not order_match and not force:
            return {
                "success": False,
                "error": "Folder order mismatch",
                "validation": {
                    "count_match": True,
                    "order_match": False,
                    "csv_titles": csv_folder_titles,
                    "current_titles": current_titles,
                }
            }

        # ---- 5. Diff: parse CSV, compare with current_state, skip unchanged ----
        actions = []  # (chat_id, folder_id, new_relation_str_or_None)
        skipped = 0
        for row in rows[1:]:
            if len(row) < 2:
                continue
            try:
                chat_id = int(row[0])
            except ValueError:
                continue

            # Convert full Telegram chat_id to peer ID for current_state lookup.
            # Channels: -100XXXXXXXXXX → XXXXXXXXXX (strip "-100")
            # Users/bots/groups: no "-100" prefix, abs() is sufficient
            if str(chat_id).startswith("-100"):
                abs_chat_id = int(str(chat_id)[4:])
            else:
                abs_chat_id = abs(chat_id)
            # Only iterate folder columns (skip chat_id, chat_name)
            for i, state_str in enumerate(row[2:]):
                if i >= len(folders):
                    break
                state_str = state_str.strip().lower()
                folder_id = folders[i].id

                # Normalize abbreviation
                if state_str in ("include", "i"):
                    new_status = "include"
                elif state_str in ("pinned", "p"):
                    new_status = "pinned"
                elif state_str in ("exclude", "x"):
                    new_status = "exclude"
                elif state_str in ("empty", "n", ""):
                    new_status = None
                else:
                    continue  # unknown token, skip

                # Check current status
                cur_status = current_state.get(abs_chat_id, {}).get(folder_id)

                if cur_status == new_status:
                    skipped += 1  # already matches, no API call needed
                else:
                    actions.append((chat_id, folder_id, new_status))

        # ---- 6. Apply only changes ----
        applied = 0
        errors = []
        for chat_id, folder_id, new_relation in actions:
            resp = self.set_chat_folder_relation(chat_id, folder_id, new_relation)
            if resp.get("success"):
                applied += 1
            else:
                errors.append(f"{chat_id}/{folder_id}: {resp.get('error','?')}")

        return {
            "success": True,
            "applied": applied,
            "skipped": skipped,
            "errors": errors[:50],
            "errors_total": len(errors),
        }

    def set_folder_flag(self, folder_id, flag, value):
        result = self.client(GetDialogFiltersRequest())
        folders = result.filters if hasattr(result, 'filters') else result
        print(folder_id, flag, value)

        for folder_ in folders:
            if "id" in folder_.__dict__ and folder_.id == folder_id:
                folder = folder_
                break

        value = bool(value)

        if flag == "contacts":
            folder.contacts = value
        elif flag == "non_contacts":
            folder.non_contacts = value
        elif flag == "groups":
            folder.groups = value
        elif flag == "broadcasts":
            folder.broadcasts = value
        elif flag == "bots":
            folder.bots = value
        elif flag == "exclude_muted":
            folder.exclude_muted = value
        elif flag == "exclude_read":
            folder.exclude_read = value
        elif flag == "exclude_archived":
            folder.exclude_archived = value
        else:
            return {
                "success": False,
                "error": "Unknown flag",
                "error_code": "unknown_flag",
            }

        try:
            self.client(UpdateDialogFilterRequest(folder.id, folder))
        except telethon.errors.rpcerrorlist.FilterIncludeEmptyError:
            return {
                "success": False,
                "error": "The include_peers vector of the filter is empty",
                "error_code": "folder_empty_error",
            }

        return {"success": True}
