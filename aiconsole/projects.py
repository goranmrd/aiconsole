# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import sys
from typing import TYPE_CHECKING, Optional
from aiconsole.code_running.run_code import reset_code_interpreters
from aiconsole.recent_projects.recent_projects import add_to_recent_projects


if TYPE_CHECKING:
    from aiconsole.agents import agents
    from aiconsole.materials import materials

from aiconsole.websockets.connection_manager import AICConnection
from aiconsole.websockets.outgoing_messages import BaseWSMessage, ProjectClosedWSMessage, ProjectLoadingWSMessage, ProjectOpenedWSMessage

_materials: Optional['materials.Materials'] = None

_agents: Optional['agents.Agents'] = None

def _create_project_message() -> BaseWSMessage:
    if not is_project_initialized():
        return ProjectClosedWSMessage()
    else:
        return ProjectOpenedWSMessage(
            path=get_project_directory(),
            name=get_project_name()
        )


def get_project_materials() -> 'materials.Materials':
    if not _materials:
        raise ValueError("Project materials are not initialized")
    return _materials


def get_project_agents() -> 'agents.Agents':
    if not _agents:
        raise ValueError("Project agents are not initialized")
    return _agents

def get_history_directory(project_path: Optional[str] = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")
    return os.path.join(get_aic_directory(project_path), "history")


def get_aic_directory(project_path: Optional[str] = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")
    return os.path.join(get_project_directory(project_path),  ".aic")


def get_project_directory(project_path: Optional[str] = None, initiating = False):
    if not is_project_initialized() and not initiating and not project_path:
        raise ValueError("Project settings are not initialized")

    if project_path:
        return project_path
        
    return os.getcwd()

def get_project_name(project_path: Optional[str] = None):
    if not is_project_initialized():
        raise ValueError("Project settings are not initialized")
    return os.path.basename(get_project_directory(project_path))


def get_credentials_directory(project_path: Optional[str] = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")
    return os.path.join(get_aic_directory(project_path), "credentials")


def is_project_initialized() -> bool:
    return _materials is not None


async def _clear_project():
    global _materials
    global _agents

    if _materials:
        _materials.stop()

    if _agents:
        _agents.stop()

    reset_code_interpreters()

    _materials = None
    _agents = None

async def close_project():
    await _clear_project()

    await _create_project_message().send_to_all()


async def reinitialize_project():
    await ProjectLoadingWSMessage().send_to_all()

    global _materials
    global _agents

    await _clear_project()

    from aiconsole.agents import agents
    from aiconsole.materials import materials
    from aiconsole.project_settings.project_settings import reload_settings

    project_dir = get_project_directory(None, True)

    await add_to_recent_projects(project_dir)

    _agents = agents.Agents("aiconsole.agents.core", os.path.join(project_dir, "agents"))
    _materials = materials.Materials("aiconsole.materials.core", os.path.join(project_dir, "materials"))

    await _materials.reload()
    await _agents.reload()
    await reload_settings()

    await _create_project_message().send_to_all()


async def send_project_init(connection: AICConnection):
    await connection.send(_create_project_message())


async def change_project_directory(path: str):
    if not os.path.exists(path):
        raise ValueError(f"Path {path} does not exist")

    # Change cwd and import path
    os.chdir(path)
    sys.path[0] = path

    await reinitialize_project()


