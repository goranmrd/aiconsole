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

from enum import Enum
from typing import List
from pydantic import BaseModel


class EditableObject(BaseModel):
    id: str
    name: str


class AssetLocation(str, Enum):
    AICONSOLE_CORE = "aiconsole"
    PROJECT_DIR = "project"


class AssetType(str, Enum):
    AGENT = "agent"
    MATERIAL = "material"


class AssetStatus(str, Enum):
    DISABLED = "disabled"
    ENABLED = "enabled"
    FORCED = "forced"


class Asset(EditableObject):
    version: str = "0.0.1"
    usage: str
    usage_examples: List[str]
    defined_in: AssetLocation
    type: AssetType
    default_status: AssetStatus = AssetStatus.ENABLED
    status: AssetStatus = AssetStatus.ENABLED
    override: bool
