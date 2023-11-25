import logging
import subprocess
import sys
from pathlib import Path

from aiconsole.consts import AICONSOLE_PATH

logger = logging.getLogger(__name__)


async def create_dedicated_venv():
    venv_path = get_current_project_venv_path()

    if not venv_path.exists():
        # should create the .venv for the first time in the current project directory
        subprocess.Popen([sys.executable, "-m", "venv", venv_path], stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE).communicate()

    try:
        # here should be access to the root of the aiconsole package (not the installed one)
        # currently it's hardcoded based on the AICONSOLE_PATH that is the installation path
        subprocess.check_call([str(venv_path / "bin" / "pip"), "install", AICONSOLE_PATH.parents[5] / "backend"])
    except subprocess.CalledProcessError as e:
        logger.error(f"Could not install aiconsole in venv {e}")


def get_current_project_venv_path():
    return Path.cwd() / ".venv"


def get_current_project_venv_python_path():
    return get_current_project_venv_path() / "bin" / "python"


def get_current_project_venv_available_packages():
    venv_path = get_current_project_venv_path()
    try:
        output = subprocess.check_output([str(venv_path / "bin" / "pip"), "list"]).decode('utf-8')
        package_lines = output.split('\\n')
        package_names = [line.split("==")[0] for line in package_lines]
        return ' '.join(package_names)
    except subprocess.CalledProcessError:
        return ''
