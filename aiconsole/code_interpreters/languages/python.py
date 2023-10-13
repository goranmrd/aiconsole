import sys
from ..subprocess_code_interpreter import SubprocessCodeInterpreter
import ast
import re
from pathlib import Path

from aiconsole.settings import settings


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

    materials_core_path = Path(__file__).parent.parent / "aiconsole" / "materials" / "core"
    agents_core_path = Path(__file__).parent.parent / "aiconsole" / "agents" / "core"

    code = f"""
import sys
import os

sys.path.append('{materials_core_path}')
sys.path.append('{agents_core_path}')
sys.path.append('{settings.MATERIALS_DIRECTORY}')
sys.path.append('{settings.AGENTS_DIRECTORY}')
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
