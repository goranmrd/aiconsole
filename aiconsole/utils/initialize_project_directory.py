import logging
import os
from shutil import copy2
from pathlib import Path


from aiconsole.settings import AICONSOLE_PATH
from aiconsole.websockets.messages import NotificationWSMessage

_log = logging.getLogger(__name__)


async def initialize_project_directory():
    from aiconsole import projects

    # if .aic does not exist in cwd, copy the entire contents of template to cwd
    if not os.path.exists(".aic"):
        _log.info("Initializing project directory ...")
        
        copy_tree(
            AICONSOLE_PATH / "template",
            Path(projects.get_project_directory())
        )

        await NotificationWSMessage(
            title="New Project",
            message=f"Project {projects.get_project_name()} directory initialized"
        ).send_to_all()
    else:
        _log.info("Project directory already initialized")


def copy_tree(src: Path, dst: Path):
    if not dst.exists():
        dst.mkdir(parents=True, exist_ok=True)

    for entry in src.iterdir():
        if entry.is_dir():
            copy_tree(entry, dst / entry.name)
            continue
        copy2(entry, dst / entry.name)
