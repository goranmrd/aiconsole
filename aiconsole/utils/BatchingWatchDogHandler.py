import watchdog.events


import asyncio
import threading


class BatchingWatchDogHandler(watchdog.events.FileSystemEventHandler):
    def __init__(self, reload):
        self.lock = threading.Lock()
        self.timer = None
        self.reload = reload

    def on_moved(self, event):
        return self.on_modified(event)

    def on_created(self, event):
        return self.on_modified(event)
    
    def on_deleted(self, event):
        return self.on_modified(event)

    def on_modified(self, event):
        if event.is_directory or not event.src_path.endswith(".toml"):
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