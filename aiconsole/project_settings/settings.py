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
    
from pydantic import BaseModel
import tomlkit
import tomlkit.exceptions
import tomlkit.container
from pathlib import Path
from typing import Any, Dict, List, Optional

import watchdog.observers

from aiconsole.materials.material import MaterialStatus
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler

class PartialSettingsData(BaseModel):
    code_autorun: Optional[bool] = None
    disabled_materials: Optional[List[str]] = None
    disabled_agents: Optional[List[str]] = None
    forced_materials: Optional[List[str]] = None
    forced_agents: Optional[List[str]] = None

class SettingsData(BaseModel):
    code_autorun: bool = False
    disabled_materials: List[str] = []
    disabled_agents: List[str] = []
    forced_materials: List[str] = []
    forced_agents: List[str] = []

class Settings:
    _settings: SettingsData

    def __init__(self):
        self._settings = SettingsData()

        self.observer = watchdog.observers.Observer()

        self.observer.schedule(BatchingWatchDogHandler(self.reload, "settings.toml"), ".")
        self.observer.start()

    def model_dump(self) -> Dict[str, Any]:
        return self._settings.model_dump()

    def stop(self):
        self.observer.stop()

    async def reload(self):
        self._settings = load_settings()

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
    
    def set_material_status(self, material_id: str, status: MaterialStatus) -> None:
        s = self._settings
        s.disabled_materials = [mid for mid in s.disabled_materials if mid != material_id]
        s.forced_materials = [mid for mid in s.forced_materials if mid != material_id]
        
        if status == MaterialStatus.DISABLED:
            s.disabled_materials.append(material_id)
        elif status == MaterialStatus.FORCED:
            s.forced_materials.append(material_id)

        save_settings(PartialSettingsData(disabled_materials=s.disabled_materials, forced_materials=s.forced_materials))

    def set_agent_status(self, agent_id: str, status: MaterialStatus) -> None:
        s = self._settings
        s.disabled_agents = [aid for aid in s.disabled_agents if aid != agent_id]
        s.forced_agents = [aid for aid in s.forced_agents if aid != agent_id]
        
        if status == MaterialStatus.DISABLED:
            s.disabled_agents.append(agent_id)
        elif status == MaterialStatus.FORCED:
            s.forced_agents.append(agent_id)

        save_settings(PartialSettingsData(disabled_agents=s.disabled_agents, forced_agents=s.forced_agents))

    def get_code_autorun(self) -> bool:
        return self._settings.code_autorun
    
    def set_code_autorun(self, code_autorun: bool) -> None:
        self._settings.code_autorun = code_autorun
        save_settings(PartialSettingsData(code_autorun=self._settings.code_autorun))


def load_settings() -> SettingsData:
    file_path: Path = Path('./settings.toml')

    if not file_path.exists():
        return SettingsData()
    
    with file_path.open() as file:
        document = tomlkit.loads(file.read())

    return SettingsData(
        code_autorun=document.get('code_autorun', False),
        disabled_materials=document.get('disabled_materials', []),
        disabled_agents=document.get('disabled_agents', []),
        forced_materials=document.get('forced_materials', []),
        forced_agents=document.get('forced_agents', []),
    )

def save_settings(settings_data: PartialSettingsData) -> None:
    file_path: Path = Path('./settings.toml')
    
    if not file_path.exists():
        document = tomlkit.document()
    else:
        with file_path.open() as file:
            document = tomlkit.loads(file.read())
    
    if settings_data.code_autorun is not None:
        document['code_autorun'] = tomlkit.item(settings_data.code_autorun)
    
    if settings_data.disabled_materials is not None:
        document['disabled_materials'] = tomlkit.item(settings_data.disabled_materials)
    
    if settings_data.disabled_agents is not None:
        document['disabled_agents'] = tomlkit.item(settings_data.disabled_agents)
    
    if settings_data.forced_materials is not None:
        document['forced_materials'] = tomlkit.item(settings_data.forced_materials)
    
    if settings_data.forced_agents is not None:
        document['forced_agents'] = tomlkit.item(settings_data.forced_agents)
    
    with file_path.open('w') as file:
        file.write(document.as_string())
