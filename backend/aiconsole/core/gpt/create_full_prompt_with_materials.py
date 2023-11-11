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
    
from typing import List
from aiconsole.core.assets.materials.rendered_material import RenderedMaterial


def create_full_prompt_with_materials(
    intro: str,
    materials: List[RenderedMaterial],
    outro: str = ""
):
    section_strs = []
    for material in materials:
        section_strs.append(material.content)

    # Construct the full prompt
    sub_str = "\n\n\n"
    full_prompt = f"{intro}\n\n\n{sub_str.join(section_strs)}\n\n\n{outro}".strip()

    return full_prompt
