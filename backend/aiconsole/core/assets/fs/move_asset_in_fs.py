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


from aiconsole.core.assets.asset import AssetType
from aiconsole.core.project.paths import get_project_assets_directory
from aiconsole.core.settings.project_settings import get_aiconsole_settings


async def move_asset_in_fs(asset_type: AssetType, old_id: str, new_id: str) -> None:
    old_file_path = get_project_assets_directory(asset_type) / f"{old_id}.toml"
    new_file_path = get_project_assets_directory(asset_type) / f"{new_id}.toml"

    # Check if the old file exists
    if not old_file_path.exists():
        raise FileNotFoundError(f"'{old_id}' does not exist.")

    # Check if the new file already exists
    if new_file_path.exists():
        raise FileExistsError(f"'{new_id}' already exists.")

    # Move (rename) the file
    old_file_path.rename(new_file_path)
    get_aiconsole_settings().rename_asset(asset_type, old_id, new_id)
