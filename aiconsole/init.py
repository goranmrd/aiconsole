import asyncio
import logging
import os
import threading
import webbrowser

from uvicorn import run


log = logging.getLogger(__name__)


def run_aiconsole(dev: bool):
    threads = []

    if dev: 
        threads.append(threading.Thread(target= lambda: os.system("cd web && yarn dev"))) 
        threads.append(threading.Timer(1, lambda: webbrowser.open("http://localhost:3000/"))) 
    else:
        threads.append(threading.Timer(2, lambda: webbrowser.open("http://localhost:8000/")))
    
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
    run_aiconsole(dev=True)


def aiconsole():
    run_aiconsole(dev=False)


if __name__ == "__main__":
    aiconsole_dev()