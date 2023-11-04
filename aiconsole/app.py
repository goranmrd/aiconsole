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
    
import asyncio
import logging
from logging import config
from contextlib import asynccontextmanager
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from aiconsole import projects
from aiconsole.api.routers import app_router
from aiconsole.project_settings import project_settings
from aiconsole.settings import AICONSOLE_PATH, settings, log_config
from aiconsole.utils.is_update_needed import is_update_needed
from aiconsole.websockets.outgoing_messages import NotificationWSMessage


@asynccontextmanager
async def lifespan(app: FastAPI):
    await project_settings.init()
    if projects.is_project_initialized():
        await projects.reinitialize_project()
    yield


config.dictConfig(log_config)

_log = logging.getLogger(__name__)


def app():
    app = FastAPI(title="AI Console", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(app_router)

    static_path = AICONSOLE_PATH / "static"
    if not static_path.exists():
        _log.warning(f"Static files directory does not exist: {static_path}")
        _log.warning("Static files will not be served")
    else:
        _log.info(f"Static files directory: {static_path}")

        @app.get("/")
        def root():
            index_path = static_path / "index.html"
            return FileResponse(str(index_path))

        @app.get("/chats/{chat_id}")
        def chats(chat_id: str):
            index_path = static_path / "index.html"
            return FileResponse(str(index_path))

        app.mount("/", StaticFiles(directory=str(static_path)))

    def check_for_update():
        _log.info("Checking for updates...")
        if is_update_needed():
            _log.info("Update available - A new version of AI Console is available!")
            asyncio.run(NotificationWSMessage(title="Update available",
                                              message="A new version of AI Console is available!").send_to_all())
        else:
            _log.info("No update available")

    threading.Timer(5, check_for_update).start()

    return app
