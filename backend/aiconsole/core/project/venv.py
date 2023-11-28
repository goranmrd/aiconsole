import logging
import subprocess
import sys
from pathlib import Path

_log = logging.getLogger(__name__)


async def create_dedicated_venv():
    venv_path = get_current_project_venv_path()
    if not venv_path.exists():
        # should create the venv for the first time in the current project directory
        _log.info(f"Creating venv in {venv_path}")
        subprocess.Popen(
            [sys.executable, "-m", "venv", venv_path, "--system-site-packages"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        ).communicate()
    else:
        _log.info(f"Venv already exists in {venv_path}")


def get_current_project_venv_path():
    return Path.cwd() / ".aic" / "venv"


def get_current_project_venv_bin_path():
    if sys.platform == "win32":
        return get_current_project_venv_path() / "Scripts"
    else:
        return get_current_project_venv_path() / "bin"


def get_current_project_venv_python_path():
    return get_current_project_venv_bin_path() / "python"


def get_current_project_venv_available_packages():
    try:
        output = subprocess.check_output([str(get_current_project_venv_python_path() / "pip"), "list"]).decode("utf-8")
        package_lines = output.split("\\n")
        package_names = [line.split("==")[0] for line in package_lines]
        return " ".join(package_names)
    except subprocess.CalledProcessError:
        return ""
