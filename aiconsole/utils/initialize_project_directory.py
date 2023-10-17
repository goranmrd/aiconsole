import logging
from pathlib import Path

from aiconsole.settings import AICONSOLE_PATH
from aiconsole.websockets.messages import NotificationWSMessage

_log = logging.getLogger(__name__)


async def initialize_project_directory():
    from aiconsole import projects

    _log.info("Initializing project directory ...")

    copy_tree(
        AICONSOLE_PATH / "template",
        Path(projects.get_project_directory())
    )

    await NotificationWSMessage(
        title="New Project",
        message=f"Project {projects.get_project_name()} directory initialized"
    ).send_to_all()


def copy_tree(src: Path, dst: Path):
    dst.mkdir(parents=True, exist_ok=True)

    for entry in src.iterdir():
        destination_path = dst / entry.name

        _log.info(destination_path)

        if entry.is_dir():
            copy_tree(entry, destination_path)
            continue

        if destination_path.exists():
            continue

        destination_path.write_bytes(entry.read_bytes())
