import logging
import os
from importlib import resources
from shutil import copy2

_log = logging.getLogger(__name__)

def initialize_project_directory():
    # if .aic does not exist in cwd, copy the entire contents of template to cwd

    if not os.path.exists(".aic"):
        _log.info("Initializing project directory ...")
        copy_tree("aiconsole.template", ".")
    else:
        _log.info("Project directory already initialized")


def copy_tree(path: str, to: str):
    os.makedirs(to, exist_ok=True)

    # Create .aic manually as it has a name starting .aic and I'm not sure if it can event be accessed using resources
    os.makedirs(os.path.join(to, ".aic"), exist_ok=True)

    for entry in resources.contents(path):
        if resources.is_resource(path, entry):
            with resources.path(path, entry) as source_path:
                copy2(source_path, os.path.join(to, entry))
        else:
            copy_tree(f"{path}.{entry}", os.path.join(to, entry))
