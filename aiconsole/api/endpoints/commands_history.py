import json
import logging
import os
from typing import Callable

from fastapi import APIRouter, Depends
from aiconsole.aic_types import Command

from aiconsole.api.json_file_operations import json_read, json_write
from aiconsole.settings import settings

router = APIRouter()
_log = logging.getLogger(__name__)


@router.get("/commands/history")
def get_history(get_json: Callable = Depends(json_read)):
    file_path = os.path.join(settings.AIC_DIRECTORY, settings.COMMANDS_HISTORY_JSON)

    return get_json(file_path=file_path, empty_obj=[])


@router.post("/commands/history")
def save_history(command: Command, store_json: Callable = Depends(json_write)):
    """
    Saves the history of sent commands to <commands_history_dir>/<commands_history_json>
    """
    file_path = os.path.join(settings.AIC_DIRECTORY, settings.COMMANDS_HISTORY_JSON)

    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            commands = json.load(f)
    else:
        commands = []

    commands.append(command.command)
    
    # remove non unique but keep the order, (but reverse it to remove the oldest first)
    commands.reverse()
    commands = list(dict.fromkeys(commands))
    commands.reverse()
    commands = commands[-settings.HISTORY_LIMIT:]

    store_json(
        directory=settings.AIC_DIRECTORY,
        file_name=settings.COMMANDS_HISTORY_JSON,
        content=commands
    )

    return commands
