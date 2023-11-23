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
# This file has been taken and slighly modified from the wonderful project
# "open-interpreter" by Killian Lucas https://github.com/KillianLucas/open-interpreter
#

import subprocess
import threading
import queue
import time
import traceback
from typing import AsyncGenerator, Generator, List

from aiconsole.core.assets.materials.material import Material
from .base_code_interpreter import BaseCodeInterpreter
import logging

_log = logging.getLogger(__name__)


class SubprocessCodeInterpreter(BaseCodeInterpreter):
    def __init__(self):
        self.start_cmd = ""
        self.process = None
        self.debug_mode = False
        self.output_queue: "queue.Queue[str]" = queue.Queue()
        self.done = threading.Event()

    def detect_end_of_execution(self, line):
        return None

    def line_postprocessor(self, line):
        return line

    def preprocess_code(self, code, materials: List[Material]):
        """
        This needs to insert an end_of_execution marker of some kind,
        which can be detected by detect_end_of_execution.

        Optionally, add active line markers for detect_active_line.
        """
        return code

    def terminate(self):
        if self.process:
            self.process.terminate()
        else:
            raise Exception("Process not started")

    def start_process(self):
        if self.process:
            self.terminate()

        self.process = subprocess.Popen(
            self.start_cmd.split(),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=0,
            universal_newlines=True,
        )
        threading.Thread(target=self.handle_stream_output, args=(self.process.stdout, False), daemon=True).start()
        threading.Thread(target=self.handle_stream_output, args=(self.process.stderr, True), daemon=True).start()

    async def run(
        self, code: str, chat_id: str, tool_call_id: str, materials: List[Material]
    ) -> AsyncGenerator[str, None]:
        retry_count = 0
        max_retries = 3

        # Setup
        try:
            code = self.preprocess_code(code, materials)
            if not self.process:
                self.start_process()
        except:
            yield traceback.format_exc()
            return

        while retry_count <= max_retries:
            if self.debug_mode:
                print(f"Running code:\n{code}\n---")

            self.done.clear()

            try:
                if not self.process or not self.process.stdin:
                    raise Exception("Process not started")

                self.process.stdin.write(code + "\n")
                self.process.stdin.flush()
                break
            except:
                if retry_count != 0:
                    # For UX, I like to hide this if it happens once. Obviously feels better to not see errors
                    # Most of the time it doesn't matter, but we should figure out why it happens frequently with:
                    # applescript
                    yield traceback.format_exc()
                    yield f"Retrying... ({retry_count}/{max_retries})"
                    yield "Restarting process."

                self.start_process()

                retry_count += 1
                if retry_count > max_retries:
                    yield "Maximum retries reached. Could not execute code.."
                    return

        while True:
            if not self.output_queue.empty():
                yield self.output_queue.get()
            else:
                time.sleep(0.1)
            try:
                output = self.output_queue.get(timeout=0.3)  # Waits for 0.3 seconds
                yield output
            except queue.Empty:
                # AIConsole Fix: Added proces.pool check to fix hanging
                if self.done.is_set() or (self.process and self.process.poll() is not None):
                    # Try to yank 3 more times from it... maybe there's something in there...
                    # (I don't know if this actually helps. Maybe we just need to yank 1 more time)

                    for _ in range(3):
                        if not self.output_queue.empty():
                            yield self.output_queue.get()
                        time.sleep(0.2)
                    break

    def handle_stream_output(self, stream, is_error_stream):
        for line in iter(stream.readline, ""):
            _log.debug(f"Received output line:\n{line}\n---")

            line = self.line_postprocessor(line)

            if line is None:
                continue  # `line = None` is the postprocessor's signal to discard completely

            if self.detect_end_of_execution(line):
                self.done.set()
            elif is_error_stream and "KeyboardInterrupt" in line:
                self.output_queue.put("KeyboardInterrupt")
                time.sleep(0.1)
                self.done.set()
            else:
                self.output_queue.put(line)
