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


from aiconsole.core.code_running.code_interpreters.base_code_interpreter import BaseCodeInterpreter
from aiconsole.core.code_running.code_interpreters.language_map import language_map


code_interpreters = {}


def get_code_interpreter(language) -> BaseCodeInterpreter:
    if language not in code_interpreters:
        # Case in-sensitive
        language = language.lower()

        try:
            code_interpreters[language] = language_map[language]()
        except KeyError:
            raise ValueError(f"Unknown or unsupported language: {language}")

    return code_interpreters[language]


def reset_code_interpreters():
    global code_interpreters

    for code_interpreter in code_interpreters.values():
        code_interpreter.terminate()

    code_interpreters = {}
