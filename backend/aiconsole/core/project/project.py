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
from pathlib import Path
from typing import TYPE_CHECKING, Optional

from aiconsole.api.websockets.connection_manager import AICConnection
from aiconsole.api.websockets.outgoing_messages import (
    InitialProjectStatusWSMessage,
    ProjectClosedWSMessage,
    ProjectLoadingWSMessage,
    ProjectOpenedWSMessage,
)
from aiconsole.core.assets.asset import AssetType
from aiconsole.core.code_running.run_code import reset_code_interpreters

if TYPE_CHECKING:
    from aiconsole.core.assets import assets


_materials: Optional["assets.Assets"] = None
_agents: Optional["assets.Assets"] = None
_project_initialized = False


async def _clear_project():
    global _materials
    global _agents
    global _project_initialized

    if _materials:
        _materials.stop()

    if _agents:
        _agents.stop()

    reset_code_interpreters()

    _materials = None
    _agents = None
    _project_initialized = False


async def send_project_init(connection: AICConnection):
    from aiconsole.core.project.paths import get_project_directory, get_project_name

    await InitialProjectStatusWSMessage(
        project_name=get_project_name() if is_project_initialized() else None,
        project_path=str(get_project_directory()) if is_project_initialized() else None,
    ).send_to_chat(connection.chat_id)


def get_project_materials() -> "assets.Assets":
    if not _materials:
        raise ValueError("Project materials are not initialized")
    return _materials


def get_project_agents() -> "assets.Assets":
    if not _agents:
        raise ValueError("Project agents are not initialized")
    return _agents


def is_project_initialized() -> bool:
    return _project_initialized


async def close_project():
    from aiconsole.core.settings.project_settings import reload_settings

    await _clear_project()

    await ProjectClosedWSMessage().send_to_all()

    await reload_settings(initial=True)


async def reinitialize_project():
    from aiconsole.core.assets import assets
    from aiconsole.core.project.paths import get_project_directory, get_project_name
    from aiconsole.core.recent_projects.recent_projects import add_to_recent_projects
    from aiconsole.core.settings.project_settings import reload_settings

    await ProjectLoadingWSMessage().send_to_all()

    global _materials
    global _agents
    global _project_initialized

    await _clear_project()

    _project_initialized = True

    project_dir = get_project_directory()

    await add_to_recent_projects(project_dir)

    _agents = assets.Assets(asset_type=AssetType.AGENT)
    _materials = assets.Assets(asset_type=AssetType.MATERIAL)

    await ProjectOpenedWSMessage(path=str(get_project_directory()), name=get_project_name()).send_to_all()

    await _materials.reload(initial=True)
    await _agents.reload(initial=True)
    await reload_settings(initial=True)


async def change_project_directory(path: Path):
    if not path.exists():
        raise ValueError(f"Path {path} does not exist")

    # Change cwd and import path
    os.chdir(path)
    sys.path[0] = str(path)

    await reinitialize_project()
