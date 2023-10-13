import os
from fastapi import Depends, Request
from typing import Callable
from aiconsole import projects
from aiconsole.api.endpoints.chats.history import _log, router
from aiconsole.api.json_file_operations import json_read, json_write
from aiconsole.settings import settings


@router.get("/headlines")
def get_history_headlines(get_json: Callable = Depends(json_read)):
    history_directory = projects.get_history_directory()
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
                    headline = history.get("headline")
                    if headline:
                        headlines.append({
                            "message": headline,
                            "id": chat_id,
                            "timestamp": timestamp
                        })
                    else:
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
                _log.error(f"Failed to get history: {e} {file.path}")
    return headlines


@router.post("/headlines/{chat_id}")
async def update_chat_headline(chat_id, req: Request, get_json: Callable = Depends(json_read), store_json: Callable = Depends(json_write)):
    data = await req.json()
    new_headline = data["headline"]
    history_directory = projects.get_history_directory()
    
    if os.path.exists(history_directory) and os.path.isdir(history_directory):
        entries = os.scandir(history_directory)
        files = [entry for entry in entries if entry.is_file()
                 and entry.name.endswith(".json")]
        file = next((file for file in files if file.name.split(".")[0] == chat_id))
        
        try:
            history = get_json(file_path=file.path, empty_obj={})
            if history: 
                history["headline"] = new_headline
                store_json(
                    directory=history_directory,
                    file_name=f"{chat_id}.json",
                    content=history
                )
        except Exception as e:
                _log.error(f"Failed to set headline: {e} {file.path}")
    return new_headline