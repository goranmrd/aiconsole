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
import tomlkit.exceptions
import tomlkit.container
from pathlib import Path
from aiconsole.materials.material import MaterialStatus
from typing import Dict, Any


class Settings:
    def __init__(self) -> None:
        self.__file_path: Path = Path('./settings.toml')
        self.__toml_data = self.__load_toml_data()
        self.__materials: Dict[str, MaterialStatus] = self.__load_section('materials')
        self.__agents: Dict[str, MaterialStatus] = self.__load_section('agents')
        self.__settings: Dict[str, Any] = self.__load_section('settings')

    def __load_toml_data(self) -> tomlkit.TOMLDocument:
        if not self.__file_path.exists():
            self.__create_empty_file()
        with self.__file_path.open() as file:
            return tomlkit.loads(file.read())

    def __create_empty_file(self) -> None:
        doc = tomlkit.document()
        doc['materials'] = tomlkit.table()
        doc['agents'] = tomlkit.table()
        doc['settings'] = tomlkit.table()
        with self.__file_path.open('w') as file:
            file.write(doc.as_string())

    def __load_section(self, section_name: str) -> Dict[str, MaterialStatus]:
        try:
            section = self.__toml_data[section_name]
        except tomlkit.exceptions.NonExistentKey:
            return {}
        
        if not isinstance(section, tomlkit.container.Container):
            return {}

        return {key: value for key, value in section.items()}

    def __get_tomlkit_table_for_input(self, input: Dict[str, Any]):
        table = tomlkit.table()

        for key, value in input.items():
            table[key] = tomlkit.string(value)

        return table

    def __save_toml_data(self) -> None:
        self.__toml_data["materials"] = self.__get_tomlkit_table_for_input(self.__materials)
        self.__toml_data["agents"] = self.__get_tomlkit_table_for_input(self.__agents)
        self.__toml_data["settings"] = self.__get_tomlkit_table_for_input(self.__settings)

        with self.__file_path.open('w') as file:
            file.write(self.__toml_data.as_string())

    def get_material_status(self, material_id: str) -> MaterialStatus:
        return MaterialStatus(self.__materials.get(material_id, MaterialStatus.ENABLED))

    def get_agent_status(self, agent_id: str) -> MaterialStatus:
        return MaterialStatus(self.__agents.get(agent_id, MaterialStatus.ENABLED))

    def set_material_status(self, material_id: str, status: MaterialStatus) -> None:
        if status == MaterialStatus.ENABLED:
            self.__materials.pop(material_id, None)
        else:
            self.__materials[material_id] = status
        self.__save_toml_data()

    def set_agent_status(self, agent_id: str, status: MaterialStatus) -> None:
        if status == MaterialStatus.ENABLED:
            self.__agents.pop(agent_id, None)
        else:
            self.__agents[agent_id] = status
        self.__save_toml_data()

    def patch(self, data: Dict[str, Any]) -> None:
        if not data:
            return
        for key, value in data.items():
            self.__settings[key] = value
        self.__save_toml_data()

    def get_settings(self) -> Dict[str, Any]:
        return self.__settings
