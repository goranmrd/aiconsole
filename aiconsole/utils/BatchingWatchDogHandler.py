import watchdog.events


import asyncio
import threading


class BatchingWatchDogHandler(watchdog.events.FileSystemEventHandler):
    def __init__(self, reload):
        self.modified_files = set()
        self.lock = threading.Lock()
        self.timer = None
        self.reload = reload

    def on_created(self, event):
        return self.on_modified(event)
    
    def on_deleted(self, event):
        return self.on_modified(event)

    def on_modified(self, event):
        if event.is_directory or not event.src_path.endswith(".toml"):
            return

        with self.lock:
            self.modified_files.add(event.src_path)

            def reload():
                with self.lock:
                    self.timer = None
                    asyncio.run(self.reload())

            if self.timer is None:
                self.timer = threading.Timer(1.0, reload)
                self.timer.start()