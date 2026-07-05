import eel
import argparse
import os

from . import eel_functions  # noqa


def set_env_vars():
    parser = argparse.ArgumentParser(
        description="Set TELEFOLDERS_API_ID and TELEFOLDERS_API_HASH"
    )
    parser.add_argument("--api_id", required=False, help="API ID for Telefolders")
    parser.add_argument("--api_hash", required=False, help="API Hash for Telefolders")
    parser.add_argument(
        "--lang",
        required=False,
        default="en",
        help="UI language: ru or en (default: en)",
    )
    parser.add_argument(
        "--proxy",
        required=False,
        default=None,
        help="Proxy URL, e.g. socks5://127.0.0.1:7897 or http://127.0.0.1:7897",
    )
    parser.add_argument(
        "--browser",
        required=False,
        nargs="?",
        const="default",
        default=None,
        help="Use built-in Eel browser (pass browser name like 'chrome', or omit for default). "
             "Without this flag, runs as pure HTTP server (access http://<IP>:8000/main.html)",
    )

    args = parser.parse_args()

    if args.api_id is not None:
        os.environ["TELEFOLDERS_API_ID"] = args.api_id
    if args.api_hash is not None:
        os.environ["TELEFOLDERS_API_HASH"] = args.api_hash

    os.environ["TELEFOLDERS_LANG"] = args.lang
    if args.proxy:
        os.environ["TELEFOLDERS_PROXY"] = args.proxy

    return args.browser


def main():
    eel.init(os.path.join(os.path.dirname(os.path.realpath(__file__)), "web"))

    browser_mode = set_env_vars()

    if browser_mode:
        # Built-in Eel browser
        print(f"[TeleFolders] Starting with built-in browser ({browser_mode})...")
        eel.start("main.html", mode=browser_mode)
    else:
        # Pure HTTP server mode — open in your own browser
        print(f"[TeleFolders] Running at http://localhost:8000/main.html")
        print(f"[TeleFolders] Open this URL in your browser. Press Ctrl+C to stop.")
        eel.start(
            "main.html",
            mode=None,
            host="0.0.0.0",
            port=8000,
        )


if __name__ == "__main__":
    set_env_vars()
    main()
