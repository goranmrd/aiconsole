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

import os
from pathlib import Path

from aiconsole.core.project.paths import get_history_directory


def list_possible_historic_chat_ids(project_path: Path | None = None):
    history_directory = get_history_directory(project_path)
    if history_directory.exists() and history_directory.is_dir():
        entries = os.scandir(history_directory)

        files = [entry for entry in entries if entry.is_file()
                 and entry.name.endswith(".json")]
        # Sort the files based on modification time (descending order)
        files = sorted(files, key=lambda entry: os.path.getmtime(
            entry.path), reverse=True)

        return [file.name.split(".")[0] for file in files]
    else:
        return []