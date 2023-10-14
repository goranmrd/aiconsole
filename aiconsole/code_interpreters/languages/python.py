#
# MIT License
#
# Copyright (c) 2023 Killian Lucas
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
#
#     ____                      ____      __                            __
#    / __ \____  ___  ____     /  _/___  / /____  _________  ________  / /____  _____
#   / / / / __ \/ _ \/ __ \    / // __ \/ __/ _ \/ ___/ __ \/ ___/ _ \/ __/ _ \/ ___/
#  / /_/ / /_/ /  __/ / / /  _/ // / / / /_/  __/ /  / /_/ / /  /  __/ /_/  __/ /
#  \____/ .___/\___/_/ /_/  /___/_/ /_/\__/\___/_/  / .___/_/   \___/\__/\___/_/
#      /_/                                         /_/
#
# This file has been taken from the wonderful project "open-interpreter" by Killian Lucas
# https://github.com/KillianLucas/open-interpreter
#

import sys

from aiconsole import projects
from ..subprocess_code_interpreter import SubprocessCodeInterpreter
import ast
import re
from pathlib import Path

from aiconsole.settings import AICONSOLE_PATH, settings
from aiconsole.materials import materials
from aiconsole.agents import agents

class Python(SubprocessCodeInterpreter):
    file_extension = "py"
    proper_name = "Python"

    def __init__(self):
        super().__init__()
        self.start_cmd = sys.executable + " -i -q -u"

    def preprocess_code(self, code):
        return preprocess_python(code)

    def line_postprocessor(self, line):
        if re.match(r'^(\s*>>>\s*|\s*\.\.\.\s*)', line):
            return None
        return line

    def detect_end_of_execution(self, line):
        return "## end_of_execution ##" in line


def preprocess_python(code):
    """
    Add active line markers
    Wrap in a try except
    Add end of execution marker
    """

    cm = projects.get_project_materials().core_resource
    ca = projects.get_project_agents().core_resource

    materials_core_path = AICONSOLE_PATH.parent
    for path_segment in cm.split("."):
        materials_core_path = materials_core_path / path_segment

    agents_core_path = AICONSOLE_PATH.parent
    for path_segment in ca.split("."):
        agents_core_path = agents_core_path / path_segment

    code = f"""
import sys
import os

sys.path.append('{materials_core_path}')
sys.path.append('{agents_core_path}')
sys.path.append('{projects.get_project_materials().user_directory}')
sys.path.append('{projects.get_project_agents().user_directory}')
        """.strip() + "\n" + code

    print(code)

    # Wrap in a try except
    code = wrap_in_try_except(code)

    # Remove any whitespace lines, as this will break indented blocks
    # (are we sure about this? test this)
    code_lines = code.split("\n")
    code_lines = [c for c in code_lines if c.strip() != ""]
    code = "\n".join(code_lines)

    # Add end command (we'll be listening for this so we know when it ends)
    code += '\n\nprint("## end_of_execution ##")'

    return code


def wrap_in_try_except(code):
    # Add import traceback
    code = "import traceback\n" + code

    # Parse the input code into an AST
    parsed_code = ast.parse(code)

    # Wrap the entire code's AST in a single try-except block
    try_except = ast.Try(
        body=parsed_code.body,
        handlers=[
            ast.ExceptHandler(
                type=ast.Name(id="Exception", ctx=ast.Load()),
                name=None,
                body=[
                    ast.Expr(
                        value=ast.Call(
                            func=ast.Attribute(value=ast.Name(id="traceback", ctx=ast.Load()), attr="print_exc",
                                               ctx=ast.Load()),
                            args=[],
                            keywords=[]
                        )
                    ),
                ]
            )
        ],
        orelse=[],
        finalbody=[]
    )

    # Assign the try-except block as the new body
    parsed_code.body = [try_except]

    # Convert the modified AST back to source code
    return ast.unparse(parsed_code)
