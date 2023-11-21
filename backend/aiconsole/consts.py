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

from pathlib import Path

from aiconsole.core.gpt.consts import GPTMode
import litellm


# FIXME: Move it to a more appropriate place
litellm.set_verbose = False
MAX_BUDGET = None

if MAX_BUDGET:
    litellm.max_budget = MAX_BUDGET

AICONSOLE_PATH = Path(__file__).parent

ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

LOG_FORMAT: str = "{asctime} {name} [{levelname}] {message}"
LOG_STYLE: str = "{"
LOG_LEVEL: str = "DEBUG"
LOG_HANDLERS: list[str] = ["console"]


HISTORY_LIMIT: int = 1000
COMMANDS_HISTORY_JSON: str = "command_history.json"

DEFAULT_MODE: str = GPTMode.SPEED.value
FUNCTION_CALL_OUTPUT_LIMIT: int = 2000


DIRECTOR_MIN_TOKENS: int = 250
DIRECTOR_PREFERRED_TOKENS: int = 1000

MAX_RECENT_PROJECTS = 8

log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {
            "()": "logging.Formatter",
            "fmt": LOG_FORMAT,
            "style": LOG_STYLE,
        }
    },
    "handlers": {
        "console": {
            "formatter": "console",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "sinkhole": {"class": "logging.NullHandler"},
    },
    "loggers": {
        "aiconsole": {
            "handlers": LOG_HANDLERS,
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "uvicorn": {
            "handlers": LOG_HANDLERS,
            "level": "INFO",
        },
    },
}
