import os
import sys

from aiconsole.agents import agents
from aiconsole.code_running.run_code import reset_code_interpreters
from aiconsole.materials import materials
from aiconsole.websockets.connection_manager import AICConnection
from aiconsole.websockets.outgoing_messages import ProjectOpenedWSMessage

_materials = materials.Materials(
    "aiconsole.materials.core",
    os.path.join(os.getcwd(), "materials")
)

_agents = agents.Agents(
    "aiconsole.agents.core",
    os.path.join(os.getcwd(), "agents")
)


def _create_project_message():
    return ProjectOpenedWSMessage(
        path=get_project_directory(),
        name=get_project_name()
    )


def get_project_materials() -> materials.Materials:
    return _materials


def get_project_agents() -> agents.Agents:
    return _agents


def get_history_directory():
    return os.path.join(get_aic_directory(), "history")


def get_aic_directory():
    return os.path.join(get_project_directory(),  ".aic")


def get_project_directory():
    return os.getcwd()


def get_project_name():
    return os.path.basename(get_project_directory())


def get_credentials_directory():
    return os.path.join(get_aic_directory(), "credentials")


async def reinitialize_project():
    global _materials
    global _agents

    _materials.stop()
    _agents.stop()

    reset_code_interpreters()
    
    _agents = agents.Agents("aiconsole.agents.core",  os.path.join(get_project_directory(), "agents"))
    _materials = materials.Materials("aiconsole.materials.core", os.path.join(get_project_directory(), "materials"))

    await _materials.reload()
    await _agents.reload()

    await _create_project_message().send_to_all()


async def send_project_init(connection: AICConnection):
    await connection.send(_create_project_message())


async def change_project_directory(path):
    if not os.path.exists(path):
        raise ValueError(f"Path {path} does not exist")
    
    # Change cwd and import path
    os.chdir(path)
    sys.path[0] = path

    await reinitialize_project()
