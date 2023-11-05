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
    
import watchdog.events


import asyncio
import threading


class BatchingWatchDogHandler(watchdog.events.FileSystemEventHandler):
    def __init__(self, reload, extension=".toml"):
        self.lock = threading.Lock()
        self.timer = None
        self.reload = reload
        self.extension = extension

    def on_moved(self, event):
        return self.on_modified(event)

    def on_created(self, event):
        return self.on_modified(event)
    
    def on_deleted(self, event):
        return self.on_modified(event)

    def on_modified(self, event):
        if event.is_directory or not event.src_path.endswith(self.extension):
            return

        with self.lock:
            def reload():
                with self.lock:
                    if self.timer is not None:
                        self.timer.cancel()
                    self.timer = None
                    asyncio.run(self.reload())

            if self.timer is None:
                self.timer = threading.Timer(1.0, reload)
                self.timer.start()