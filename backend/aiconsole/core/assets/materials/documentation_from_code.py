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

import importlib.util
import logging
import inspect
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aiconsole.core.assets.materials.material import Material

_log = logging.getLogger(__name__)


def documentation_from_code(material: "Material", source: str):
    """
    Creates content of a material from a python material file.
    """

    def create_content(context):
        # Create a new module
        spec = importlib.util.spec_from_loader("temp_module", loader=None)

        if not spec:
            raise Exception("Could not create spec for temp_module")

        # Load the new module into memory
        python_module = importlib.util.module_from_spec(spec)

        # Compile the source into a code object that can be executed by exec()
        code_object = compile(source, "temp_module", "exec")

        # Define a new, blank namespace and execute the code object within it
        exec(code_object, python_module.__dict__)

        function_list = []
        for name, obj in inspect.getmembers(python_module):
            # take only locally defined exports, no imports
            if name.startswith("_"):
                continue

            if inspect.isfunction(obj):
                # Extract function signature
                async_prefix = "async " if inspect.iscoroutinefunction(obj) else ""
                signature = inspect.signature(obj)
                function_declaration = f"{async_prefix}def {name}{signature}"
                doc = inspect.getdoc(obj) or ""
                function_list.append(
                    f"""
{function_declaration}
{doc}
""".strip()
                    + "\n\n\n"
                )

        # get main docstring
        docstring = inspect.getdoc(python_module)

        newline = "\n"
        final_doc = f"""
{docstring + newline + newline if docstring else ''}

## Variables and Functions Available When Executing Python Code

{(newline + newline).join(function_list)}
""".strip()

        return final_doc

    return create_content
