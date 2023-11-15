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

import os
from typing import TYPE_CHECKING, List


if TYPE_CHECKING:
    from aiconsole.core.assets.assets import Assets

from ..subprocess_code_interpreter import SubprocessCodeInterpreter


class AppleScript(SubprocessCodeInterpreter):
    file_extension = "applescript"
    proper_name = "AppleScript"

    def __init__(self):
        super().__init__()
        self.start_cmd = os.environ.get("SHELL", "/bin/zsh")

    def preprocess_code(self, code, materials: List["Assets"]):
        """
        Inserts an end_of_execution marker and adds active line indicators.
        """

        # Escape double quotes
        code = code.replace('"', r"\"")

        # Wrap in double quotes
        code = '"' + code + '"'

        # Prepend start command for AppleScript
        code = "osascript -e " + code

        # Append end of execution indicator
        code += '; echo "## end_of_execution ##"'

        return code

    def detect_end_of_execution(self, line):
        """
        Detects end of execution marker in the output.
        """
        return "## end_of_execution ##" in line
