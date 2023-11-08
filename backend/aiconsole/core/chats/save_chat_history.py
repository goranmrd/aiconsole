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

from aiconsole.core.chat.types import Chat
from aiconsole.core.project.paths import get_history_directory


def save_chat_history(chat: Chat):
    history_directory = get_history_directory()
    file_path = history_directory / f"{chat.id}.json"

    if len(chat.message_groups) == 0:
        # delete instead
        if os.path.exists(file_path):
            os.remove(file_path)
    else:
        os.makedirs(history_directory, exist_ok=True)
        with open(file_path, "w") as f:
            json.dump(chat.model_dump(exclude={"id", "last_modified"}),
                      f,
                      indent=4)
