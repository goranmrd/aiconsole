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
from pathlib import Path
from typing import Dict, List, Optional
from aiconsole.core.materials.fs.delete_material_from_fs import delete_material_from_fs
from aiconsole.core.materials.fs.load_material_from_fs import load_material_from_fs
from aiconsole.core.materials.fs.move_material_in_fs import move_material_in_fs
from aiconsole.core.materials.fs.save_material_to_fs import save_material_to_fs

import watchdog.events
import watchdog.observers
from aiconsole.core.materials.material import (Material, MaterialLocation, MaterialStatus)
from aiconsole.core.project.paths import get_core_materials_directory, get_project_materials_directory
from aiconsole.core.settings.project_settings import get_aiconsole_settings
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler
from aiconsole.utils.list_files_in_file_system import list_files_in_file_system
from aiconsole.api.websockets.outgoing_messages import (ErrorWSMessage,
                                                    MaterialsUpdatedWSMessage)

_log = logging.getLogger(__name__)


class Materials:
    """
    Materials' class is for managing the .md and .py material files.
    """

    _materials: Dict[str, Material]

    def __init__(self):
        self._materials = {}

        self.observer = watchdog.observers.Observer()

        os.makedirs(get_project_materials_directory(), exist_ok=True)
        self.observer.schedule(BatchingWatchDogHandler(self.reload),
                               get_project_materials_directory(),
                               recursive=True)
        self.observer.start()

    def stop(self):
        self.observer.stop()

    def all_materials(self) -> List[Material]:
        """
        Return all loaded materials.
        """
        return list(self._materials.values())

    def enabled_materials(self) -> List[Material]:
        """
        Return all enabled loaded materials.
        """
        settings = get_aiconsole_settings()
        return [
            material for material in self._materials.values() if
            settings.get_material_status(material.id) in [
                MaterialStatus.ENABLED]
        ]

    def forced_materials(self) -> List[Material]:
        """
        Return all forced loaded materials.
        """
        settings = get_aiconsole_settings()
        return [
            material for material in self._materials.values() if
            settings.get_material_status(material.id) in [
                MaterialStatus.FORCED]
        ]

    @property
    def materials_project_dir(self) -> Dict[str, Material]:
        """
        Return all forced loaded materials.
        """
        return {
            material.id: material
            for material in self._materials.values()
            if material.defined_in == MaterialLocation.PROJECT_DIR
        }

    @property
    def materials_aiconsole_core(self) -> Dict[str, Material]:
        """
        Return all forced loaded materials.
        """
        return {
            material.id: material
            for material in self._materials.values()
            if material.defined_in == MaterialLocation.AICONSOLE_CORE
        }

    async def save_material(self, material: Material, new: bool, old_material_id: Optional[str] = None):
        self._materials[material.id] = await save_material_to_fs(material, new, old_material_id)

    def delete_material(self, material_id):
        delete_material_from_fs(material_id)
        del self._materials[material_id]

    def move(self, old_material_id: str, new_material_id: str) -> None:
        move_material_in_fs(old_material_id, new_material_id)

    def get_material(self, name):
        """
        Get a specific material.
        """
        if name not in self._materials:
            raise KeyError(f"Material {name} not found")
        return self._materials[name]

    async def reload(self):
        _log.info("Reloading materials ...")

        self._materials = {}

        material_ids = set([
            os.path.splitext(os.path.basename(path))[0]
            for paths_yielding_function in [
                list_files_in_file_system(get_core_materials_directory()),
                list_files_in_file_system(get_project_materials_directory()),
            ] for path in paths_yielding_function
            if os.path.splitext(Path(path))[-1] == ".toml"
        ])

        for id in material_ids:
            try:
                self._materials[id] = await load_material_from_fs(id)
            except Exception as e:
                await ErrorWSMessage(
                    error=f"Invalid material {id} {e}",
                ).send_to_all()
                continue

        await MaterialsUpdatedWSMessage(
            count=len(self._materials),
        ).send_to_all()
