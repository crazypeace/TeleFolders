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
        default="ru",
        help="UI language: ru or en (default: ru)",
    )

    args = parser.parse_args()

    if args.api_id is not None:
        os.environ["TELEFOLDERS_API_ID"] = args.api_id
    if args.api_hash is not None:
        os.environ["TELEFOLDERS_API_HASH"] = args.api_hash

    os.environ["TELEFOLDERS_LANG"] = args.lang


def main():
    eel.init(os.path.join(os.path.dirname(os.path.realpath(__file__)), "web"))

    chrome_args = [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
    ]

    eel.start(
        "main.html",
        mode="chrome",
        host="0.0.0.0",
        cmdline_args=chrome_args,
    )


if __name__ == "__main__":
    set_env_vars()
    main()
