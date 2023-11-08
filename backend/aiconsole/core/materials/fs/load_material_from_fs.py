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
    
import rtoml
from aiconsole.api.websockets.outgoing_messages import NotificationWSMessage
from aiconsole.core.materials.material import Material, MaterialContentType, MaterialLocation
from aiconsole.core.project.paths import get_core_materials_directory, get_project_directory, get_project_materials_directory


import os


async def load_material_from_fs(material_id: str):
    """
    Load a specific material.
    """

    project_dir_path = get_project_materials_directory()
    core_resource_path = get_core_materials_directory()

    if (project_dir_path / f"{material_id}.toml").exists():
        # if material exists in core
        if (core_resource_path / f"{material_id}.toml").exists():
            await NotificationWSMessage(
                title=f"Material {material_id} exists in core and project directory",
                message="Project directory version will be used.",
            ).send_to_all()
        location = MaterialLocation.PROJECT_DIR
        path = project_dir_path / f"{material_id}.toml"
    elif (core_resource_path / f"{material_id}.toml").exists():
        location = MaterialLocation.AICONSOLE_CORE
        path = core_resource_path / f"{material_id}.toml"
    else:
        raise KeyError(f"Material {material_id} not found")

    with open(path, "r") as file:
        tomldoc = rtoml.loads(file.read())

    material_id = os.path.splitext(os.path.basename(path))[0]

    material = Material(
        id=material_id,
        version=str(tomldoc.get("version", "0.0.1")).strip(),
        name=str(tomldoc.get("name", material_id)).strip(),
        defined_in=location,
        usage=str(tomldoc["usage"]).strip(),
        content_type=MaterialContentType(
            str(tomldoc["content_type"]).strip()))

    if "content_static_text" in tomldoc:
        material.content_static_text = \
            str(tomldoc["content_static_text"]).strip()

    if "content_dynamic_text" in tomldoc:
        material.content_dynamic_text = \
            str(tomldoc["content_dynamic_text"]).strip()

    if "content_api" in tomldoc:
        material.content_api = \
            str(tomldoc["content_api"]).strip()

    return material
