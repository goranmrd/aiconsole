import os

from aiconsole.agents import agents
from aiconsole.materials import materials
from aiconsole.utils.initialize_project_directory import initialize_project_directory
from aiconsole.websockets.messages import DebugJSONWSMessage

_materials = materials.Materials("aiconsole.materials.core", os.path.join(os.getcwd(), "materials"))
_agents = agents.Agents("aiconsole.agents.core", os.path.join(os.getcwd(), "agents"))

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

def get_credentials_directory():
    return os.path.join(get_aic_directory(), "credentials")

async def reinitialize_project():
    global _materials
    global _agents

    initialize_project_directory()
    
    _agents = agents.Agents("aiconsole.agents.core",  os.path.join(get_project_directory(), "agents"))
    _materials = materials.Materials("aiconsole.materials.core", os.path.join(get_project_directory(), "materials"))

    await _materials.reload()
    await _agents.reload()

async def change_project_directory(path):
    if not os.path.exists(path):
        raise ValueError(f"Path {path} does not exist")
    
    # Change cwd
    os.chdir(path)
    await DebugJSONWSMessage(message="Changed project directory to " + path, object={}).send_to_all()

    await reinitialize_project()


