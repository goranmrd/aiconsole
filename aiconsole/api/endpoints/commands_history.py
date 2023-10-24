# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
    
import json
import logging
import os
from typing import Callable

from fastapi import APIRouter, Depends
from aiconsole import projects
from aiconsole.chat.types import Command
from aiconsole.settings import settings

from aiconsole.api.json_file_operations import json_read, json_write

router = APIRouter()
_log = logging.getLogger(__name__)


@router.get("/commands/history")
def get_history(get_json: Callable = Depends(json_read)):
    file_path = os.path.join(projects.get_aic_directory(), settings.COMMANDS_HISTORY_JSON)

    return get_json(file_path=file_path, empty_obj=[])


@router.post("/commands/history")
def save_history(command: Command, store_json: Callable = Depends(json_write)):
    """
    Saves the history of sent commands to <commands_history_dir>/<commands_history_json>
    """
    file_path = os.path.join(projects.get_aic_directory(), settings.COMMANDS_HISTORY_JSON)

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
        directory=projects.get_aic_directory(),
        file_name=settings.COMMANDS_HISTORY_JSON,
        content=commands
    )

    return commands
