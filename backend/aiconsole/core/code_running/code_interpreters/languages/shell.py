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

import platform
from typing import List

from aiconsole.core.assets.materials.material import Material
from ..subprocess_code_interpreter import SubprocessCodeInterpreter
import os

class Shell(SubprocessCodeInterpreter):
    file_extension = "sh"
    proper_name = "Shell"

    def __init__(self):
        super().__init__()

        # Determine the start command based on the platform
        if platform.system() == 'Windows':
            self.start_cmd = 'cmd.exe'
        else:
            self.start_cmd = os.environ.get('SHELL', 'bash')

    def preprocess_code(self, code, materials: List[Material]):
        return preprocess_shell(code)
    
    def line_postprocessor(self, line):
        return line

    def detect_end_of_execution(self, line):
        return "## end_of_execution ##" in line
        

def preprocess_shell(code):
    """
    Add active line markers
    Wrap in a try except (trap in shell)
    Add end of execution marker
    """
    
    # Wrap in a trap for errors
    if platform.system() != 'Windows':
        code = wrap_in_trap(code)
    
    # Add end command (we'll be listening for this so we know when it ends)
    code += '\necho "## end_of_execution ##"'
    
    return code




def wrap_in_trap(code):
    """
    Wrap Bash code with a trap to catch errors and display them.
    """
    trap_code = """
trap 'echo "An error occurred on line $LINENO"; exit' ERR
set -E
"""
    return trap_code + code
