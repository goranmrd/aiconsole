import importlib.util
import logging
import os
import re
from typing import Dict, Union

import watchdog.events
import watchdog.observers

from aiconsole.aic_types import Material, StaticMaterial
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler
from aiconsole.materials.documentation_from_code import documentation_from_code
from aiconsole.utils.list_files_in_file_system import list_files_in_file_system
from aiconsole.utils.list_files_in_resource_path import list_files_in_resource_path
from aiconsole.websockets.messages import NotificationWSMessage

_log = logging.getLogger(__name__)


class Materials:
    """
    Materials' class is for managing the .md and .py material files.
    """

    materials: Dict[str, Material]

    def __init__(self, core_resource, user_agents_directory):
        self.core_resource = core_resource
        self.user_directory = user_agents_directory
        self.materials = {}

        self.observer = watchdog.observers.Observer()
        self.observer.schedule(BatchingWatchDogHandler(self.reload), self.user_directory, recursive=True)
        self.observer.start()

    def __del__(self):
        self.observer.stop()

    def all_materials(self):
        """
        Return all loaded materials.
        """
        return list(self.materials.values())
    

    def save_static(self, material: StaticMaterial):
        """
        Save a static material.
        """
        self.materials[material.id] = Material(
            id=material.id, usage=material.usage, content=lambda context, content=material.content: content
        )

        # Save to .md file
        with open(os.path.join(self.user_directory, f"{material.id}.md"), "w") as file:
            file.write(f"<!--- {material.usage} -->\n\n{material.content}")

    def delete_material(self, name):
        """
        Delete a specific material.
        """
        if name not in self.materials:
            raise KeyError(f"Material {name} not found")
        del self.materials[name]

    async def reload(self):
        _log.info("Reloading materials ...")

        self.materials = {}

        paths = [path for paths_yielding_function in [
            list_files_in_resource_path(self.core_resource),
            list_files_in_file_system(self.user_directory)
        ] for path in paths_yielding_function]

        for path in paths:
            filename = os.path.basename(path)
            if filename.endswith(".py"):
                # Import the file and execute material function to get the material
                module_name = os.path.splitext(filename)[0]
                spec = importlib.util.spec_from_file_location(
                    module_name, path)
                if not spec or spec.loader is None:
                    await NotificationWSMessage(title="Material not loaded", message=f"Skipping invalid material in file {filename}").send_to_all()
                    continue

                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                material = module.material

                if not material or not isinstance(material, dict) or "usage" not in material:
                    await NotificationWSMessage(title="Material not loaded", message=f"Skipping invalid material in file {filename}").send_to_all()
                    continue

                id = filename[:-3]
                if id in self.materials:
                    await NotificationWSMessage(title="Material not loaded", message=f"Skipping duplicate material {id} in file {filename}").send_to_all()
                    continue

                if "content" not in material:
                    material["content"] = documentation_from_code(module_name, path)
            
                self.materials[id] = Material(
                    id=id, usage=material["usage"], content=material["content"]
                )
            elif filename.endswith(".md"):
                with open(path, "r", encoding="utf-8") as file:
                    lines = file.readlines()

                    # Merging all lines into a single string
                    text = "".join(lines)

                    pattern = r"\s*(<!---|<!--)\s*(.*?)\s*(-->)\s*(.*)\s*"

                    match = re.match(pattern, text.strip(), re.DOTALL)

                    if not match:
                        await NotificationWSMessage(title="Material not loaded", message=f"Skipping invalid material in file {filename}").send_to_all()
                        continue

                    # Extracting 'usage' and 'content' based on matched groups
                    usage = match.group(2)
                    content = match.group(4)

                    # Pruning leading/trailing spaces and newlines (if any)
                    usage = usage.strip()
                    content = content.strip()

                    material_id = os.path.splitext(filename)[0]
                    if material_id in self.materials:
                        await NotificationWSMessage(title="Material not loaded", message=f"Skipping duplicate material {material_id} in file {filename}").send_to_all()
                        continue

                    self.materials[material_id] = Material(
                        id=material_id,
                        usage=usage,
                        content=lambda context, content=content: content,
                    )

        await NotificationWSMessage(title="Materials reloaded", message=f"Reloaded {len(self.materials)} materials").send_to_all()
