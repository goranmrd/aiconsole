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
import traceback
from aiconsole.core.assets.asset import Asset, AssetLocation, AssetType
from aiconsole.core.assets.asset import AssetStatus
from aiconsole.core.assets.materials.documentation_from_code import documentation_from_code
from aiconsole.core.assets.materials.rendered_material import RenderedMaterial
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aiconsole.core.assets.materials.content_evaluation_context import ContentEvaluationContext


class MaterialContentType(str, Enum):
    STATIC_TEXT = "static_text"
    DYNAMIC_TEXT = "dynamic_text"
    API = "api"


class Material(Asset):
    type: AssetType = AssetType.MATERIAL
    id: str
    name: str
    version: str = "0.0.1"
    usage: str
    defined_in: AssetLocation

    # Content, either static or dynamic
    content_type: MaterialContentType = MaterialContentType.STATIC_TEXT
    content_static_text: str = """

content, content content

## Sub header

Bullets in sub header:
* Bullet 1
* Bullet 2
* Bullet 3

""".strip()
    content_dynamic_text: str = """

import random
    
async def content(context):
    samples = ['sample 1' , 'sample 2', 'sample 3', 'sample 4']
    return f'''
# Examples of great content
{random.sample(samples, 2)}

'''.strip()

""".strip()
    content_api: str = """

'''
Add here general API description
'''

def create():
    '''
    Add comment when to use this function, and add example of usage:
    ```python
        create()
    ```
    '''
    print("Created")


def print_list():
    '''
    Use this function to print 'List'.
    Sample of use:
    ```python
        print_list()
    ```

    '''
    print("List")



def fibonacci(n):
    '''
    Use it to calculate and return the nth term of the Fibonacci sequence.
    Sample of use:
    ```python
      fibonacci(10)
    ```
    '''
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)
""".strip()

    async def render(self, context: "ContentEvaluationContext"):
        header = f"# {self.name}\n\n"

        try:
            if self.content_type == MaterialContentType.DYNAMIC_TEXT:
                # Try compiling the python code and run it
                source_code = compile(self.content_dynamic_text, "<string>", "exec")
                local_vars = {}
                exec(source_code, local_vars)
                content_func = local_vars.get("content")
                if callable(content_func):
                    return RenderedMaterial(id=self.id, content=header + await content_func(context), error="")
                return RenderedMaterial(id=self.id, content="", error="No callable content function found!")
            elif self.content_type == MaterialContentType.STATIC_TEXT:
                return RenderedMaterial(id=self.id, content=header + self.content_static_text, error="")
            elif self.content_type == MaterialContentType.API:
                return RenderedMaterial(
                    id=self.id, content=header + documentation_from_code(self, self.content_api)(context), error=""
                )
        except Exception:
            return RenderedMaterial(id=self.id, content="", error=traceback.format_exc())

        raise ValueError("Material has no content")


class MaterialWithStatus(Material):
    status: AssetStatus = AssetStatus.ENABLED
