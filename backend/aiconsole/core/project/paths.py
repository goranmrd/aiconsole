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
from pathlib import Path
from aiconsole.core.assets.asset import AssetType
from aiconsole.core.project.project import is_project_initialized
from aiconsole.utils.resource_to_path import resource_to_path

def get_project_assets_directory(asset_type: AssetType, project_path: Path | None = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")

    return get_project_directory(project_path) / f"{asset_type.value}s"

def get_core_assets_directory(asset_type: AssetType):
    return resource_to_path(f"aiconsole.preinstalled.{asset_type.value}s")


def get_history_directory(project_path: Path | None = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")
    return get_aic_directory(project_path) / "history"


def get_aic_directory(project_path: Path | None = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")
    return get_project_directory(project_path) / ".aic"


def get_project_directory(project_path: Path | None = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")

    if project_path:
        return project_path

    return Path(os.getcwd())


def get_credentials_directory(project_path: Path | None = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")
    return get_aic_directory(project_path) / "credentials"


def get_project_name(project_path: Path | None = None):
    if not is_project_initialized() and not project_path:
        raise ValueError("Project settings are not initialized")
    return get_project_directory(project_path).name
