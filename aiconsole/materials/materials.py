import logging
import os
from pathlib import Path
import tomlkit
from typing import Dict, List
import watchdog.events
import watchdog.observers
from aiconsole.materials.material import MaterialContentType, MaterialStatus
from aiconsole.materials.material import MaterialLocation, Material
from aiconsole.project_settings.settings import Settings
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler
from aiconsole.utils.list_files_in_file_system import list_files_in_file_system
from aiconsole.utils.list_files_in_resource_path import list_files_in_resource_path
from aiconsole.utils.resource_to_path import resource_to_path
from aiconsole.websockets.outgoing_messages import NotificationWSMessage

_log = logging.getLogger(__name__)


class Materials:
    """
    Materials' class is for managing the .md and .py material files.
    """

    _materials: Dict[str, Material]

    def __init__(self, core_resource: str, user_agents_directory: str):
        self.core_resource = core_resource
        self.user_directory = user_agents_directory
        self._materials = {}
        self._settings = Settings()

        self.observer = watchdog.observers.Observer()

        os.makedirs(self.user_directory, exist_ok=True)
        self.observer.schedule(BatchingWatchDogHandler(self.reload),
                               self.user_directory,
                               recursive=True)
        self.observer.start()

    def stop(self):
        self.observer.stop()

    def all_materials(self):
        """
        Return all loaded materials.
        """
        return list(self._materials.values())

    def available_materials(self) -> List[Material]:
        """
        Return all available loaded materials.
        """
        return [material for material in self._materials.values() if material.status in [MaterialStatus.ENABLED, MaterialStatus.FORCED]]

    def enabled_materials(self) -> List[Material]:
        """
        Return all available loaded materials.
        """
        return [material for material in self._materials.values() if material.status == MaterialStatus.ENABLED]

    def forced_materials(self) -> List[Material]:
        """
        Return all available loaded materials.
        """
        return [material for material in self._materials.values() if material.status == MaterialStatus.FORCED]

    def save_material(self, material: Material):

        current_version = self._materials.get(material.id, Material(
            id="unknown",
            version="0.0.1",
            name="",
            defined_in=MaterialLocation.PROJECT_DIR,
            usage="",
        )).version

        #Parse version number
        current_version = current_version.split(".")

        #Increment version number
        current_version[-1] = str(int(current_version[-1]) + 1)

        #Join version number
        material.version = ".".join(current_version)
        
        self._materials[material.id] = material

        try:
            path = {
                MaterialLocation.PROJECT_DIR: Path(self.user_directory),
            }[material.defined_in]
        except KeyError:
            raise Exception("Material need to be defined in project.")

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

    def save_material_status(self, material_id: str, status: MaterialStatus):
        self._settings.set_material_status(material_id, status)
        self._materials[material_id].status = status

    def load_material(self, material_id: str):
        """
        Load a specific material.
        """

        project_dir_path = Path(self.user_directory)
        core_resource_path = resource_to_path(self.core_resource)

        if (project_dir_path / f"{material_id}.toml").exists():
            location = MaterialLocation.PROJECT_DIR
            path = project_dir_path / f"{material_id}.toml"
        elif (core_resource_path / f"{material_id}.toml").exists():
            location = MaterialLocation.AICONSOLE_CORE
            path = core_resource_path / f"{material_id}.toml"
        else:
            raise KeyError(f"Material {material_id} not found")

        with path.open("r") as file:
            tomldoc = dict(tomlkit.loads(file.read()))

        material_id = os.path.splitext(os.path.basename(path))[0]

        self._materials[material_id] = Material(
            id=material_id,
            version=str(tomldoc.get("version", "0.0.1")).strip(),
            name=str(tomldoc.get("name", material_id)).strip(),
            defined_in=location,
            usage=str(tomldoc["usage"]).strip(),
            content_type=MaterialContentType(
                str(tomldoc["content_type"]).strip()
            ),
            status=self._settings.get_material_status(material_id)
        )

        if "content_static_text" in tomldoc:
            self._materials[material_id].content_static_text = \
                str(tomldoc["content_static_text"]).strip()

        if "content_dynamic_text" in tomldoc:
            self._materials[material_id].content_dynamic_text = \
                str(tomldoc["content_dynamic_text"]).strip()

        if "content_api" in tomldoc:
            self._materials[material_id].content_api = \
                str(tomldoc["content_api"]).strip()

    def get_material(self, name):
        """
        Get a specific material.
        """
        if name not in self._materials:
            raise KeyError(f"Material {name} not found")
        return self._materials[name]

    def delete_material(self, material_id):
        """
        Delete a specific material.
        """
        if material_id in self._materials:
            material = self._materials[material_id]

            path = {
                MaterialLocation.PROJECT_DIR: Path(self.user_directory),
            }[material.defined_in]

            material_file_path = path / f"{material_id}.toml"
            if material_file_path.exists():
                material_file_path.unlink()
                return

        raise KeyError(f"Material with ID {material_id} not found")

    async def reload(self):
        _log.info("Reloading materials ...")

        self._materials = {}

        material_ids = set([
            os.path.splitext(os.path.basename(path))[0]
            for paths_yielding_function in [
                list_files_in_resource_path(self.core_resource),
                list_files_in_file_system(self.user_directory),
            ] for path in paths_yielding_function
            if os.path.splitext(Path(path))[-1] == ".toml"
        ])

        for id in material_ids:
            try:
                self.load_material(id)
            except Exception as e:
                await NotificationWSMessage(
                    title="Material not loaded",
                    message=f"Skipping invalid material {id} {e}",
                ).send_to_all()
                continue

        await NotificationWSMessage(
            title="Materials reloaded",
            message=f"Reloaded {len(self._materials)} materials",
        ).send_to_all()
