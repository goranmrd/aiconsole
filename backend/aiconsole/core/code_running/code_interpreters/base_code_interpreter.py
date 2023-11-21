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


from typing import AsyncGenerator, Generator
from aiconsole.core.assets.materials.material import Material


class BaseCodeInterpreter:
    """
    .run is a generator that yields a dict with attributes: active_line, output
    """

    def __init__(self):
        pass

    async def run(
        self, code: str, chat_id: str, tool_call_id: str, materials: list[Material]
    ) -> AsyncGenerator[str, None]:
        yield "Not implemented"

    def terminate(self):
        pass
