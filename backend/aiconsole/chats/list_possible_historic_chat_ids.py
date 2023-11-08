import os
from typing import Optional

from aiconsole import projects


def list_possible_historic_chat_ids(project_path: Optional[str] = None):
    history_directory = projects.get_history_directory(project_path)
    if os.path.exists(history_directory) and os.path.isdir(history_directory):
        entries = os.scandir(history_directory)

        files = [entry for entry in entries if entry.is_file()
                 and entry.name.endswith(".json")]
        # Sort the files based on modification time (descending order)
        files = sorted(files, key=lambda entry: os.path.getmtime(
            entry.path), reverse=True)

        return [file.name.split(".")[0] for file in files]
    else:
        return []