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

from aiconsole.core.assets.asset import Asset
import tomlkit
from aiconsole.core.assets.agents.agent import Agent
from aiconsole.core.assets.fs.load_asset_from_fs import load_asset_from_fs
from aiconsole.core.assets.materials.material import Material, MaterialContentType
from aiconsole.core.project.paths import get_project_assets_directory


async def save_asset_to_fs(asset: Asset):
    path = get_project_assets_directory(asset.type)

    try:
        current_version = (await load_asset_from_fs(asset.type, asset.id)).version
    except KeyError:
        current_version = "0.0.1"

    # Parse version number
    current_version = current_version.split(".")

    # Increment version number
    current_version[-1] = str(int(current_version[-1]) + 1)

    # Join version number
    asset.version = ".".join(current_version)

    # Save to .toml file
    with (path / f"{asset.id}.toml").open("w") as file:
        # FIXME: preserve formatting and comments in the file using tomlkit

        # Ignore None values in model_dump
        model_dump = asset.model_dump()
        for key in list(model_dump.keys()):
            if model_dump[key] is None:
                del model_dump[key]

        def make_sure_starts_and_ends_with_newline(s: str):
            if not s.startswith("\n"):
                s = "\n" + s

            if not s.endswith("\n"):
                s = s + "\n"

            return s

        doc = tomlkit.document()
        doc.append("name", tomlkit.string(asset.name))
        doc.append("version", tomlkit.string(asset.version))
        doc.append("usage", tomlkit.string(asset.usage))
        doc.append("usage_examples", tomlkit.item(asset.usage_examples))
        doc.append("default_status", tomlkit.string(asset.default_status))

        if isinstance(asset, Material):
            doc.append("content_type", tomlkit.string(asset.content_type))

            {
                MaterialContentType.STATIC_TEXT: lambda: doc.append(
                    "content_static_text",
                    tomlkit.string(
                        make_sure_starts_and_ends_with_newline(asset.content_static_text),
                        multiline=True,
                    ),
                ),
                MaterialContentType.DYNAMIC_TEXT: lambda: doc.append(
                    "content_dynamic_text",
                    tomlkit.string(
                        make_sure_starts_and_ends_with_newline(asset.content_dynamic_text),
                        multiline=True,
                    ),
                ),
                MaterialContentType.API: lambda: doc.append(
                    "content_api",
                    tomlkit.string(
                        make_sure_starts_and_ends_with_newline(asset.content_api),
                        multiline=True,
                    ),
                ),
            }[asset.content_type]()

        if isinstance(asset, Agent):
            if asset.id == "user":
                raise Exception("Cannot save agent with id 'user'.")

            doc.append("system", tomlkit.string(asset.system))
            doc.append("gpt_mode", tomlkit.string(asset.gpt_mode))
            doc.append("execution_mode", tomlkit.string(asset.execution_mode))

        file.write(doc.as_string())

    return asset
