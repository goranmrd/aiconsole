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
    
from aiconsole.core.project.paths import get_project_materials_directory


def move_material_in_fs(old_material_id: str, new_material_id: str) -> None:
    old_material_file_path = get_project_materials_directory() / f"{old_material_id}.toml"
    new_material_file_path = get_project_materials_directory() / f"{new_material_id}.toml"

    # Check if the old file exists
    if not old_material_file_path.exists():
        raise FileNotFoundError(f"'{old_material_id}' does not exist.")

    # Check if the new file already exists
    if new_material_file_path.exists():
        raise FileExistsError(f"'{new_material_id}' already exists.")

    # Move (rename) the file
    old_material_file_path.rename(new_material_file_path)