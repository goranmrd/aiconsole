from pathlib import Path
from aiconsole.settings import AICONSOLE_PATH


def resource_to_path(resource) -> Path:
    abs_path = AICONSOLE_PATH.parent

    for path_segment in resource.split("."):
        abs_path = abs_path / path_segment

    return abs_path