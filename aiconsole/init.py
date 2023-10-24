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
    
import logging

from uvicorn import run


log = logging.getLogger(__name__)


def _get_app(prod: bool) -> str:
    if prod:
        return "aiconsole.app:app_prod"
    return "aiconsole.app:app_dev"


def run_aiconsole(dev: bool) -> None:
    try:
        run(
            _get_app(not dev),
            host="0.0.0.0",
            port=8000,
            reload=dev,
            factory=True,
        )
    except KeyboardInterrupt:
        log.info("Exiting ...")


def aiconsole_dev():
    run_aiconsole(dev=True)


def aiconsole():
    run_aiconsole(dev=False)


if __name__ == "__main__":
    aiconsole_dev()