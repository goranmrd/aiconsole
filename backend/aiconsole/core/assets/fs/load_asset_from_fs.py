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

import logging
import os

import rtoml
from aiconsole.core.assets.agents.agent import Agent
from aiconsole.core.assets.asset import Asset, AssetLocation, AssetStatus, AssetType
from aiconsole.core.assets.materials.material import Material, MaterialContentType
from aiconsole.core.gpt.consts import GPTMode
from aiconsole.core.project.paths import get_core_assets_directory, get_project_assets_directory

_log = logging.getLogger(__name__)


async def load_asset_from_fs(asset_type: AssetType, asset_id: str, location: AssetLocation | None = None) -> Asset:
    """
    Load a specific asset.
    """

    project_dir_path = get_project_assets_directory(asset_type)
    core_resource_path = get_core_assets_directory(asset_type)

    if (project_dir_path / f"{asset_id}.toml").exists() and (
        location == None or location == AssetLocation.PROJECT_DIR
    ):
        if (core_resource_path / f"{asset_id}.toml").exists():
            _log.info(f"Asset {asset_id} exists in core and project directory")
        location = AssetLocation.PROJECT_DIR
        path = project_dir_path / f"{asset_id}.toml"
    elif (core_resource_path / f"{asset_id}.toml").exists() and (
        location == None or location == AssetLocation.AICONSOLE_CORE
    ):
        location = AssetLocation.AICONSOLE_CORE
        path = core_resource_path / f"{asset_id}.toml"
    else:
        raise KeyError(f"Asset {asset_id} not found")

    with open(path, "r") as file:
        tomldoc = rtoml.loads(file.read())

    asset_id = os.path.splitext(os.path.basename(path))[0]

    params = {
        "id": asset_id,
        "name": str(tomldoc.get("name", asset_id)).strip(),
        "version": str(tomldoc.get("version", "0.0.1")).strip(),
        "defined_in": location,
        "usage": str(tomldoc["usage"]).strip(),
        "usage_examples": tomldoc.get("usage_examples", []),
        "default_status": AssetStatus(str(tomldoc.get("default_status", "enabled")).strip()),
        "override": location == AssetLocation.PROJECT_DIR and (core_resource_path / f"{asset_id}.toml").exists(),
    }

    if asset_type == AssetType.MATERIAL:
        material = Material(
            **params,
            content_type=MaterialContentType(str(tomldoc["content_type"]).strip()),
        )

        if "content_static_text" in tomldoc:
            material.content_static_text = str(tomldoc["content_static_text"]).strip()

        if "content_dynamic_text" in tomldoc:
            material.content_dynamic_text = str(tomldoc["content_dynamic_text"]).strip()

        if "content_api" in tomldoc:
            material.content_api = str(tomldoc["content_api"]).strip()

        return material

    if asset_type == AssetType.AGENT:
        if asset_id == "user":
            raise KeyError("Agent 'user' is reserved.")

        params["system"] = str(tomldoc["system"]).strip()

        if "gpt_mode" in tomldoc:
            params["gpt_mode"] = GPTMode(str(tomldoc["gpt_mode"]).strip())

        if "execution_mode" in tomldoc:
            params["execution_mode"] = str(tomldoc["execution_mode"]).strip()

        agent = Agent(**params)

        return agent

    raise Exception(f"Asset type {asset_type} not supported.")
