import os
from fastapi import Depends
from typing import Callable
from aiconsole.api.endpoints.chats.history import log, router
from aiconsole.api.json_file_operations import json_read
from aiconsole.settings import settings


@router.get("/headlines")
def get_history_headlines(get_json: Callable = Depends(json_read)):
    history_directory = settings.HISTORY_DIRECTORY
    headlines = []
    if os.path.exists(history_directory) and os.path.isdir(history_directory):
        entries = os.scandir(history_directory)

        files = [entry for entry in entries if entry.is_file()
                 and entry.name.endswith(".json")]
        # Sort the files based on modification time (descending order)
        files = sorted(files, key=lambda entry: os.path.getmtime(
            entry.path), reverse=True)

        for file in files:
            try:
                chat_id = file.name.split(".")[0]
                history = get_json(file_path=file.path, empty_obj={})

                if history:
                    timestamp = history.get("timestamp")
                    for msg in history.get("messages"):
                        if msg.get("role") == "user":
                            first_msg = msg.get("content")
                            headlines.append({
                                "message": first_msg,
                                "id": chat_id,
                                "timestamp": timestamp
                            })
                            break  # Exit the loop after finding the first user message

            except Exception as e:
                log.error(f"Failed to get history: {e} {file.path}")
    return headlines
