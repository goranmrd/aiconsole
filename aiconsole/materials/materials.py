import logging
import os
from pathlib import Path
import tomlkit
from typing import Dict

import watchdog.events
import watchdog.observers

from aiconsole.materials.material import MaterialLocation, Material
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler
from aiconsole.utils.list_files_in_file_system import list_files_in_file_system
from aiconsole.utils.list_files_in_resource_path import list_files_in_resource_path
from aiconsole.utils.resource_to_path import resource_to_path
from aiconsole.websockets.messages import NotificationWSMessage

_log = logging.getLogger(__name__)


class Materials:
    """
    Materials' class is for managing the .md and .py material files.
    """

    _materials: Dict[str, Material]

    def __init__(self, core_resource, user_agents_directory):
        self.core_resource = core_resource
        self.user_directory = user_agents_directory
        self._materials = {}

        self.observer = watchdog.observers.Observer()
        self.observer.schedule(
            BatchingWatchDogHandler(self.reload), self.user_directory, recursive=True
        )
        self.observer.start()

    def __del__(self):
        self.observer.stop()

    def all_materials(self):
        """
        Return all loaded materials.
        """
        return list(self._materials.values())

    def save_material(self, material: Material):
        self._materials[material.id] = material

        # Save to .toml file
        with open(os.path.join(self.user_directory, f"{material.id}.toml"), "w") as file:
            #FIXME: preserve formatting and comments in the file using tomlkit


            # Ignore None values in model_dump
            model_dump = material.model_dump()
            for key in list(model_dump.keys()):
                if model_dump[key] is None:
                    del model_dump[key]
            file.write(tomlkit.dumps(model_dump))

    def load_material(self, material_id: str, location: MaterialLocation):
        """
        Load a specific material.
        """

        source_path = {
            MaterialLocation.PROJECT_DIR: Path(self.user_directory),
            MaterialLocation.AICONSOLE_CORE: resource_to_path(self.core_resource),
        }[location]

        path = source_path / f"{material_id}.toml"

        if not path.exists():
            raise KeyError(f"Material {material_id} not found")

        with path.open("r") as file:
            material = tomlkit.loads(file.read())

        self._materials[material_id] = Material.model_validate(material)
        

    def get_material(self, name):
        """
        Get a specific material.
        """
        if name not in self._materials:
            raise KeyError(f"Material {name} not found")
        return self._materials[name]

    def delete_material(self, name):
        """
        Delete a specific material.
        """
        if name not in self._materials:
            raise KeyError(f"Material {name} not found")
        del self._materials[name]

    async def reload(self):
        _log.info("Reloading materials ...")

        self._materials = {}

        paths = [
            path
            for paths_yielding_function in [
                list_files_in_resource_path(self.core_resource),
                list_files_in_file_system(self.user_directory),
            ]
            for path in paths_yielding_function
        ]

        for path in paths:
            filename = os.path.basename(path)
            if filename.endswith(".toml"):
                # Load the material from the .toml file
                with open(path, "r") as file:
                    material = tomlkit.loads(file.read())
                    try:
                        material = Material.model_validate(material)
                    except Exception:
                        await NotificationWSMessage(
                            title="Material not loaded",
                            message=f"Skipping invalid material in file {filename}",
                        ).send_to_all()
                        continue

                if material.id in self._materials:
                    await NotificationWSMessage(
                        title="Material not loaded",
                        message=f"Skipping duplicate material {material.id} in file {filename}",
                    ).send_to_all()
                    continue

                self._materials[material.id] = material

        await NotificationWSMessage(
            title="Materials reloaded",
            message=f"Reloaded {len(self._materials)} materials",
        ).send_to_all()
