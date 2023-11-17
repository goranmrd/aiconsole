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
import datetime
import logging
from pathlib import Path
from typing import Any

import litellm
import tomlkit
import tomlkit.container
import tomlkit.exceptions
from aiconsole.api.websockets.outgoing_messages import SettingsWSMessage
from aiconsole.core.assets.asset import AssetStatus, AssetType
from aiconsole.core.project import project
from aiconsole.core.project.paths import get_project_directory
from aiconsole.core.project.project import is_project_initialized
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler
from aiconsole.utils.recursive_merge import recursive_merge
from appdirs import user_config_dir
from pydantic import BaseModel
from tomlkit import TOMLDocument
from watchdog.observers import Observer

_log = logging.getLogger(__name__)


class PartialSettingsData(BaseModel):
    code_autorun: bool | None = None
    openai_api_key: str | None = None
    materials: dict[str, AssetStatus] = {}
    materials_to_reset: list[str] = []
    agents: dict[str, AssetStatus] = {}
    agents_to_reset: list[str] = []
    to_global: bool = False


class PartialSettingsAndToGlobal(PartialSettingsData):
    to_global: bool = False


class SettingsData(BaseModel):
    code_autorun: bool = False
    openai_api_key: str | None = None
    materials: dict[str, AssetStatus] = {}
    agents: dict[str, AssetStatus] = {}


def _load_from_path(file_path: Path) -> dict[str, Any]:
    with file_path.open() as file:
        document = tomlkit.loads(file.read())

    return dict(document)


def _set_openai_api_key_environment(settings: SettingsData) -> None:
    openai_api_key = settings.openai_api_key

    # This is so we make sure that it's overiden and does not env variables etc
    litellm.openai_key = openai_api_key or "invalid key"


class Settings:
    def __init__(self, project_path: Path | None = None):
        self._suppress_notification_until = None
        self._settings = SettingsData()

        self._global_settings_file_path = Path(user_config_dir("aiconsole")) / "settings.toml"

        if project_path:
            self._project_settings_file_path = project_path / "settings.toml"
        else:
            self._project_settings_file_path = None

        self._observer = Observer()

        self._global_settings_file_path.parent.mkdir(parents=True, exist_ok=True)
        self._observer.schedule(
            BatchingWatchDogHandler(self.reload, self._global_settings_file_path.name),
            str(self._global_settings_file_path.parent),
            recursive=True,
        )

        if self._project_settings_file_path:
            self._project_settings_file_path.parent.mkdir(parents=True, exist_ok=True)
            self._observer.schedule(
                BatchingWatchDogHandler(self.reload, self._project_settings_file_path.name),
                str(self._project_settings_file_path.parent),
                recursive=True,
            )

        self._observer.start()

    def model_dump(self) -> dict[str, Any]:
        return self._settings.model_dump()

    def stop(self):
        self._observer.stop()

    async def reload(self, initial: bool = False):
        self._settings = await self.__load()
        await SettingsWSMessage(
            initial=initial
            or not (
                not self._suppress_notification_until or self._suppress_notification_until < datetime.datetime.now()
            )
        ).send_to_all()
        self._suppress_notification_until = None

    def get_asset_status(self, asset_type: AssetType, id: str) -> AssetStatus:
        s = self._settings

        if asset_type == AssetType.MATERIAL:
            if id in s.materials:
                return s.materials[id]
            asset = project.get_project_materials().get_asset(id)
            default_status = asset.default_status if asset else AssetStatus.ENABLED
            return default_status
        elif asset_type == AssetType.AGENT:
            if id in s.agents:
                return s.agents[id]
            asset = project.get_project_agents().get_asset(id)
            default_status = asset.default_status if asset else AssetStatus.ENABLED
            return default_status

        else:
            raise ValueError(f"Unknown asset type {asset_type}")

    def rename_asset(self, asset_type: AssetType, old_id: str, new_id: str):
        if asset_type == AssetType.MATERIAL:
            partial_settings = PartialSettingsData(
                materials_to_reset=[old_id], materials={new_id: self.get_asset_status(asset_type, old_id)}
            )
        elif asset_type == AssetType.AGENT:
            partial_settings = PartialSettingsData(
                agents_to_reset=[old_id], agents={new_id: self.get_asset_status(asset_type, old_id)}
            )
        else:
            raise ValueError(f"Unknown asset type {asset_type}")

        self.save(partial_settings, to_global=True)

    def set_asset_status(self, asset_type: AssetType, id: str, status: AssetStatus, to_global: bool = False) -> None:
        if asset_type == AssetType.MATERIAL:
            self.save(PartialSettingsData(materials={id: status}), to_global=to_global)
        elif asset_type == AssetType.AGENT:
            self.save(PartialSettingsData(agents={id: status}), to_global=to_global)
        else:
            raise ValueError(f"Unknown asset type {asset_type}")

    def get_code_autorun(self) -> bool:
        return self._settings.code_autorun

    def set_code_autorun(self, code_autorun: bool, to_global: bool = False) -> None:
        self._settings.code_autorun = code_autorun
        self.save(PartialSettingsData(code_autorun=self._settings.code_autorun), to_global=to_global)

    async def __load(self) -> SettingsData:
        settings = {}
        paths = [self._global_settings_file_path, self._project_settings_file_path]

        for file_path in paths:
            if file_path and file_path.exists():
                settings = recursive_merge(settings, _load_from_path(file_path))

        forced_agents = [agent for agent, status in settings.get("agents", {}).items() if status == AssetStatus.FORCED]

        settings_materials = settings.get("materials", {})

        materials = {}
        for material, status in settings_materials.items():
            materials[material] = AssetStatus(status)

        agents = {}
        for agent, status in settings.get("agents", {}).items():
            agents[agent] = AssetStatus(status)

        settings_data = SettingsData(
            code_autorun=settings.get("settings", {}).get("code_autorun", False),
            openai_api_key=settings.get("settings", {}).get("openai_api_key", None),
            materials=materials,
            agents=agents,
        )

        # Enforce only one forced agent
        if len(forced_agents) > 1:
            _log.warning(f"More than one agent is forced: {forced_agents}")
            for agent in forced_agents[1:]:
                settings_data.agents[agent] = AssetStatus.ENABLED

        _set_openai_api_key_environment(settings_data)

        _log.info(f"Loaded settings")
        return settings_data

    @staticmethod
    def __get_tolmdocument_to_save(file_path: Path) -> TOMLDocument:
        if not file_path.exists():
            document = tomlkit.document()
            document["settings"] = tomlkit.table()
            document["materials"] = tomlkit.table()
            document["agents"] = tomlkit.table()
            return document

        with file_path.open() as file:
            document = tomlkit.loads(file.read())
            for section in ["settings", "materials", "agents"]:
                if section not in dict(document):
                    document[section] = tomlkit.table()

        return document

    def save(self, settings_data: PartialSettingsData, to_global: bool = False) -> None:
        if to_global:
            file_path = self._global_settings_file_path
        else:
            if not self._project_settings_file_path:
                raise ValueError("Cannnot save to project settings file, because project is not initialized")

            file_path = self._project_settings_file_path

        document = self.__get_tolmdocument_to_save(file_path)
        doc_settings: tomlkit.table.Table = document["settings"]
        doc_materials: tomlkit.table.Table = document["materials"]
        doc_agents: tomlkit.table.Table = document["agents"]

        if settings_data.code_autorun is not None:
            doc_settings["code_autorun"] = settings_data.code_autorun

        if settings_data.openai_api_key is not None:
            doc_settings["openai_api_key"] = settings_data.openai_api_key

        for material in settings_data.materials_to_reset:
            if material in doc_materials:
                del doc_materials[material]

        for agent in settings_data.agents_to_reset:
            if agent in doc_agents:
                del doc_agents[agent]

        for material in settings_data.materials:
            doc_materials[material] = settings_data.materials[material].value

        was_forced = False
        for agent in settings_data.agents:
            doc_agents[agent] = settings_data.agents[agent].value
            if settings_data.agents[agent] == AssetStatus.FORCED:
                was_forced = agent

        if was_forced:
            for agent in doc_agents:
                if agent != was_forced and doc_agents[agent] == AssetStatus.FORCED.value:
                    doc_agents[agent] = AssetStatus.ENABLED.value

        self._suppress_notification_until = datetime.datetime.now() + datetime.timedelta(seconds=30)

        file_path.parent.mkdir(parents=True, exist_ok=True)
        with file_path.open("w") as file:
            file.write(document.as_string())


async def init():
    global _settings
    _settings = Settings(get_project_directory() if is_project_initialized() else None)
    await _settings.reload()


def get_aiconsole_settings() -> Settings:
    return _settings


async def reload_settings(initial: bool = False):
    global _settings
    _settings.stop()
    _settings = Settings(get_project_directory() if is_project_initialized() else None)
    await _settings.reload(initial)
