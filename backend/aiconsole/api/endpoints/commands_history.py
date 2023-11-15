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
import os

from aiconsole.consts import COMMANDS_HISTORY_JSON, HISTORY_LIMIT
from aiconsole.core.chat.types import Command
from aiconsole.core.project import project
from aiconsole.core.project.paths import get_aic_directory
from fastapi import APIRouter

router = APIRouter()


@router.get("/commands/history")
def get_history():
    file_path = os.path.join(get_aic_directory(), COMMANDS_HISTORY_JSON)

    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            commands = json.load(f)
    else:
        commands = []

    return commands


@router.post("/commands/history")
def save_history(command: Command):
    """
    Saves the history of sent commands to <commands_history_dir>/<commands_history_json>
    """
    file_path = os.path.join(get_aic_directory(), COMMANDS_HISTORY_JSON)

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
    commands = commands[-HISTORY_LIMIT:]

    with open(file_path, "w") as f:
        json.dump(commands, f)

    return commands
