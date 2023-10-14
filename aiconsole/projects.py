import os

from fastapi import WebSocket

from aiconsole.agents import agents
from aiconsole.code_interpreters.code_interpreters import reset_code_interpreters
from aiconsole.materials import materials
from aiconsole.utils.initialize_project_directory import initialize_project_directory
from aiconsole.websockets.messages import ProjectOpenedWSMessage

# TODO: Better focus frames for material editing
# TODO: useSocket wrapped in React elem
# TODO: Scrollbar in materials list

# TODO: /profile/user.jpg has wrong paths

# TODO: Rework so I can only edit editable materials


_materials = materials.Materials(
    "aiconsole.materials.core",
    os.path.join(os.getcwd(),
    "materials")
)

_agents = agents.Agents(
    "aiconsole.agents.core",
    os.path.join(os.getcwd(),
    "agents")
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

    reset_code_interpreters()

    await initialize_project_directory()
    
    _agents = agents.Agents("aiconsole.agents.core",  os.path.join(get_project_directory(), "agents"))
    _materials = materials.Materials("aiconsole.materials.core", os.path.join(get_project_directory(), "materials"))

    await _materials.reload()
    await _agents.reload()

    await _create_project_message().send_to_all()

async def send_project_init(ws: WebSocket):
    await _create_project_message().send_to_one(ws)

async def change_project_directory(path):
    if not os.path.exists(path):
        raise ValueError(f"Path {path} does not exist")
    
    # Change cwd
    os.chdir(path)

    await reinitialize_project()


