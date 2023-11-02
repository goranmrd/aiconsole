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
import os

from appdirs import user_config_dir
from pydantic import BaseModel
import tomlkit
import tomlkit.exceptions
import tomlkit.container
from pathlib import Path
from typing import Any, Dict, List, Optional

import watchdog.observers
from tomlkit import TOMLDocument

from aiconsole.materials.material import MaterialStatus
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler
from aiconsole.utils.recursive_merge import recursive_merge
from aiconsole.websockets.outgoing_messages import SettingsWSMessage


class PartialSettingsData(BaseModel):
    code_autorun: Optional[bool] = None
    openai_api_key: Optional[str] = None
    disabled_materials: Optional[List[str]] = None
    disabled_agents: Optional[List[str]] = None
    enabled_materials: Optional[List[str]] = None
    enabled_agents: Optional[List[str]] = None
    forced_materials: Optional[List[str]] = None
    forced_agents: Optional[List[str]] = None
    to_global: bool = False


class SettingsData(BaseModel):
    code_autorun: bool = False
    openai_api_key: Optional[str] = None
    disabled_materials: List[str] = []
    disabled_agents: List[str] = []
    enabled_materials: List[str] = []
    enabled_agents: List[str] = []
    forced_materials: List[str] = []
    forced_agents: List[str] = []


class Settings:
    _settings: SettingsData

    def __init__(self):
        self._settings = SettingsData()

        self._global_settings_file_path = self.__get__settings_file_path(Path(user_config_dir('aiconsole')) / "settings.toml")
        self._project_settings_file_path = self.__get__settings_file_path(Path("settings.toml"))

        self.__setup_observer()

    def __setup_observer(self):
        self.observer = watchdog.observers.Observer()

        self.observer.schedule(
            BatchingWatchDogHandler(
                self.reload,
                self._global_settings_file_path.name
            ),
            str(self._global_settings_file_path.parent)
        )
        self.observer.schedule(
            BatchingWatchDogHandler(
                self.reload,
                self._project_settings_file_path.name
            ),
            str(self._project_settings_file_path.parent)
        )

        self.observer.start()

    @classmethod
    def __get__settings_file_path(cls, file_path: Path) -> Path:
        if not file_path.exists():
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.touch()
        return file_path

    def model_dump(self) -> Dict[str, Any]:
        return self._settings.model_dump()

    def stop(self):
        self.observer.stop()

    async def reload(self):
        self._settings = self.load()
        await SettingsWSMessage().send_to_all()

    def get_material_status(self, material_id: str) -> MaterialStatus:
        s = self._settings
        if material_id in s.forced_materials:
            return MaterialStatus.FORCED
        if material_id in s.disabled_materials:
            return MaterialStatus.DISABLED
        return MaterialStatus.ENABLED
    
    def get_agent_status(self, agent_id: str) -> MaterialStatus:
        s = self._settings
        if agent_id in s.forced_agents:
            return MaterialStatus.FORCED
        if agent_id in s.disabled_agents:
            return MaterialStatus.DISABLED
        return MaterialStatus.ENABLED
    
    def set_material_status(self, material_id: str, status: MaterialStatus, to_global: bool = False) -> None:
        partial_dict = {
            MaterialStatus.DISABLED: {'disabled_materials': [material_id]},
            MaterialStatus.ENABLED: {'enabled_materials': [material_id]},
            MaterialStatus.FORCED: {'forced_materials': [material_id]}
        }
        self.save(PartialSettingsData(**partial_dict[status]), to_global=to_global)

    def set_agent_status(self, agent_id: str, status: MaterialStatus, to_global: bool = False) -> None:
        partial_dict = {
            MaterialStatus.DISABLED: {'disabled_agents': [agent_id]},
            MaterialStatus.ENABLED: {'enabled_agents': [agent_id]},
            MaterialStatus.FORCED: {'forced_agents': [agent_id]}
        }
        self.save(PartialSettingsData(**partial_dict[status]), to_global=to_global)

    def get_code_autorun(self) -> bool:
        return self._settings.code_autorun
    
    def set_code_autorun(self, code_autorun: bool, to_global: bool = False) -> None:
        self._settings.code_autorun = code_autorun
        self.save(PartialSettingsData(code_autorun=self._settings.code_autorun), to_global=to_global)

    @staticmethod
    def __set_openai_api_key_environment(settings: Dict[str, Any]) -> None:
        openai_api_key = settings.get('settings', {}).get('openai_api_key', None)
        if os.environ.get("OPENAI_API_KEY", None) != openai_api_key:
            os.environ["OPENAI_API_KEY"] = openai_api_key

    @staticmethod
    def __load_from_path(file_path: Path) -> Dict[str, Any]:
        if not file_path.exists():
            return {}

        with file_path.open() as file:
            document = tomlkit.loads(file.read())

        return dict(document)

    def load(self) -> SettingsData:
        settings = {}
        for file_path in [self._global_settings_file_path, self._project_settings_file_path]:
            settings = recursive_merge(settings, self.__load_from_path(file_path))

        self.__set_openai_api_key_environment(settings)

        return SettingsData(
            code_autorun=settings.get('settings', {}).get('code_autorun', False),
            openai_api_key=settings.get('settings', {}).get('openai_api_key', None),
            disabled_materials=[
                material for material, status in settings.get('materials', {}).items() if
                status == MaterialStatus.DISABLED.value
            ],
            disabled_agents=[
                agent for agent, status in settings.get('agents', {}).items() if status == MaterialStatus.DISABLED.value
            ],
            forced_materials=[
                material for material, status in settings.get('materials', {}).items() if
                status == MaterialStatus.FORCED.value
            ],
            forced_agents=[
                agent for agent, status in settings.get('agents', {}).items() if status == MaterialStatus.DISABLED.value
            ]
        )

    def __get_file_path_to_save(self, to_global: bool) -> Path:
        return self._global_settings_file_path if to_global else self._project_settings_file_path

    @staticmethod
    def __get_tolmdocument_to_save(file_path: Path) -> TOMLDocument:
        if not file_path.exists():
            document = tomlkit.document()
            document['settings'] = tomlkit.table()
            document['materials'] = tomlkit.table()
            document['agents'] = tomlkit.table()
            return document

        with file_path.open() as file:
            document = tomlkit.loads(file.read())
            for section in ['settings', 'materials', 'agents']:
                if section not in dict(document):
                    document[section] = tomlkit.table()

        return document

    def save(self, settings_data: PartialSettingsData, to_global: bool = False) -> None:
        file_path = self.__get_file_path_to_save(to_global)
        document = self.__get_tolmdocument_to_save(file_path)

        if settings_data.code_autorun is not None:
            document['settings']['code_autorun'] = settings_data.code_autorun

        if settings_data.openai_api_key is not None:
            document['settings']['openai_api_key'] = settings_data.openai_api_key

        if settings_data.disabled_materials is not None:
            for material in settings_data.disabled_materials:
                document['materials'][material] = MaterialStatus.DISABLED.value
        
        if settings_data.forced_materials is not None:
            for material in settings_data.forced_materials:
                document['materials'][material] = MaterialStatus.FORCED.value

        if settings_data.enabled_materials is not None:
            for material in settings_data.enabled_materials:
                document['materials'][material] = MaterialStatus.ENABLED.value

        if settings_data.disabled_agents is not None:
            for agent in settings_data.disabled_agents:
                document['agents'][agent] = MaterialStatus.DISABLED.value

        if settings_data.forced_agents is not None:
            for agent in settings_data.forced_agents:
                document['agents'][agent] = MaterialStatus.FORCED.value

        if settings_data.enabled_agents is not None:
            for agent in settings_data.enabled_agents:
                document['agents'][agent] = MaterialStatus.ENABLED.value

        with file_path.open('w') as file:
            file.write(document.as_string())
