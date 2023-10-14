from pathlib import Path

from aiconsole.settings import AICONSOLE_PATH


def list_files_in_resource_path(path: str):
    """
    Recursively list all paths to files in path
    """
    abs_path = AICONSOLE_PATH.parent
    for path_segment in path.split("."):
        abs_path = abs_path / path_segment


    if not abs_path.exists():
        return

    for entry in abs_path.iterdir():
        if entry.is_file():
            yield entry
        else:
            yield from list_files_in_resource_path(str(entry).replace('/', '.'))
