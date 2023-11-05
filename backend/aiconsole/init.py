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
import os
import threading
import webbrowser
import requests
import time

from uvicorn import run

log = logging.getLogger(__name__)

def open_browser_when_frontend_is_up(url:str):
    log.info("Waiting for the frontend to start ...")
    
    while True:
        try:
            requests.get(url)
            break
        except requests.exceptions.ConnectionError:
            log.debug("Waiting for the frontend to start ...")
            time.sleep(0.2)

    webbrowser.open(url)


def run_aiconsole(dev: bool, launch_browser: bool):
    threads = []

    if dev:
        threads.append(threading.Thread(target=lambda: os.system("cd web && yarn dev")))
        if launch_browser:
            threads.append(threading.Thread(target=lambda: open_browser_when_frontend_is_up("http://localhost:3000/")))
    else:
        if launch_browser:
            threads.append(threading.Thread(target=lambda: open_browser_when_frontend_is_up("http://localhost:8000/")))

    for thread in threads:
        thread.start()

    try:
        run(
            "aiconsole.app:app",
            host="0.0.0.0",
            port=8000,
            reload=dev,
            factory=True,
        )
    except KeyboardInterrupt:
        log.info("Exiting ...")

        for thread in threads:
            thread.join()


def aiconsole_dev():
    run_aiconsole(dev=True, launch_browser=True)


def aiconsole():
    run_aiconsole(dev=False, launch_browser=True)

if __name__ == "__main__":
    aiconsole_dev()
