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

from aiconsole.agents import agents
from aiconsole.code_running.run_code import reset_code_interpreters
from aiconsole.materials import materials
from aiconsole.websockets.connection_manager import AICConnection
from aiconsole.websockets.outgoing_messages import ProjectOpenedWSMessage
from aiconsole.project_settings.settings import Settings

_materials = materials.Materials(
    "aiconsole.materials.core",
    os.path.join(os.getcwd(), "materials")
)

_agents = agents.Agents(
    "aiconsole.agents.core",
    os.path.join(os.getcwd(), "agents")
)

_settings = Settings()

def _create_project_message():
    return ProjectOpenedWSMessage(
        path=get_project_directory(),
        name=get_project_name()
    )


def get_project_materials() -> materials.Materials:
    return _materials


def get_project_agents() -> agents.Agents:
    return _agents


def get_project_settings() -> Settings:
    return _settings


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
    global _settings

    _materials.stop()
    _agents.stop()
    _settings.stop()

    reset_code_interpreters()
    
    _agents = agents.Agents("aiconsole.agents.core",  os.path.join(get_project_directory(), "agents"))
    _materials = materials.Materials("aiconsole.materials.core", os.path.join(get_project_directory(), "materials"))
    _settings = Settings()

    await _materials.reload()
    await _agents.reload()
    await _settings.reload()

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
