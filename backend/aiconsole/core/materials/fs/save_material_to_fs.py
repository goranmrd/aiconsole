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
    
import tomlkit
from aiconsole.core.materials.fs.load_material_from_fs import load_material_from_fs
from aiconsole.core.materials.material import Material, MaterialContentType, MaterialLocation
from aiconsole.core.materials.fs.move_material_in_fs import move_material_in_fs
from aiconsole.core.project.paths import get_project_materials_directory


async def save_material_to_fs(material: Material, create: bool, old_material_id: str | None = None):
    if material.defined_in != MaterialLocation.PROJECT_DIR:
        raise Exception("Cannot save material not defined in project.")

    path = get_project_materials_directory()
    file_path = path / f"{material.id}.toml"

    if create and file_path.exists():
        raise Exception(f"Material {material.id} already exists.")

    if not create and not (path / f"{old_material_id}.toml").exists():
        raise Exception(f"Material {old_material_id} does not exist.")

    if not create and old_material_id and not file_path.exists():
        move_material_in_fs(old_material_id, material.id)

    try:
        current_version = (await load_material_from_fs(material.id)).version
    except KeyError:
        current_version = "0.0.1"

    # Parse version number
    current_version = current_version.split(".")

    # Increment version number
    current_version[-1] = str(int(current_version[-1]) + 1)

    # Join version number
    material.version = ".".join(current_version)

    # Save to .toml file
    with (path / f"{material.id}.toml").open("w") as file:
        # FIXME: preserve formatting and comments in the file using tomlkit

        # Ignore None values in model_dump
        model_dump = material.model_dump()
        for key in list(model_dump.keys()):
            if model_dump[key] is None:
                del model_dump[key]

        def make_sure_starts_and_ends_with_newline(s: str):
            if not s.startswith('\n'):
                s = '\n' + s

            if not s.endswith('\n'):
                s = s + '\n'

            return s

        doc = tomlkit.document()
        doc.append("name", tomlkit.string(material.name))
        doc.append("version", tomlkit.string(material.version))
        doc.append("usage", tomlkit.string(material.usage))
        doc.append("content_type", tomlkit.string(material.content_type))

        {
            MaterialContentType.STATIC_TEXT:
            lambda: doc.append(
                "content_static_text",
                tomlkit.string(make_sure_starts_and_ends_with_newline(
                    material.content_static_text),
                    multiline=True)),
            MaterialContentType.DYNAMIC_TEXT:
            lambda: doc.append(
                "content_dynamic_text",
                tomlkit.string(make_sure_starts_and_ends_with_newline(
                    material.content_dynamic_text),
                    multiline=True)),
            MaterialContentType.API:
            lambda: doc.append(
                "content_api",
                tomlkit.string(make_sure_starts_and_ends_with_newline(
                    material.content_api),
                    multiline=True)),
        }[material.content_type]()

        file.write(doc.as_string())

    return material