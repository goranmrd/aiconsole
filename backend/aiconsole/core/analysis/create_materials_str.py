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

from aiconsole.core.assets.asset import AssetStatus
from aiconsole.core.project import project


import random


def create_materials_str() -> str:
    new_line = "\n"

    # We add forced becuase it may influence the choice of enabled materials
    available_materials = [
        *project.get_project_materials().assets_with_status(AssetStatus.FORCED),
        *project.get_project_materials().assets_with_status(AssetStatus.ENABLED),
    ]

    random_materials = (
        new_line.join([f"* {c.id} - {c.usage}" for c in random.sample(available_materials, len(available_materials))])
        if available_materials
        else ""
    )

    return random_materials
