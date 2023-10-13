import json
import os
from pathlib import Path
import logging
from typing import Callable, Union

from fastapi import HTTPException, status

_log = logging.getLogger(__name__)


def json_write() -> Callable[[str, str, Union[dict, list]], None]:
    def wrapper(directory: str, file_name: str, content: Union[dict, list]):
        try:
            os.makedirs(directory, exist_ok=True)
            with open(Path(directory) / file_name, "w") as f:
                json.dump(content, f, indent=4)
        except Exception as e:
            _log.error(f"Failed to save to json file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save history"
            )

    return wrapper


def json_read() -> Callable[[str, Union[dict, list]], Union[dict, list]]:
    def wrapper(file_path: str, empty_obj: Union[dict, list]):
        try:
            if not os.path.exists(file_path):
                return empty_obj

            with open(file_path, "r") as f:
                data = json.load(f)

            return data

        except Exception as e:
            _log.error(f"Failed to read file: {e} {file_path}")
            raise HTTPException(
                status_code=500,
                detail="Failed to read file"
            )

    return wrapper
