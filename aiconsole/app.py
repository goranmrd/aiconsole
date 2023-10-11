import asyncio
from importlib import resources
import logging
from logging import config
from contextlib import asynccontextmanager
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from aiconsole.agents.agents import agents
from aiconsole.api.routers import app_router
from aiconsole.materials.materials import materials
from aiconsole.settings import settings, log_config
from aiconsole.utils.initialize_project_directory import initialize_project_directory
from aiconsole.utils.is_update_needed import is_update_needed
from aiconsole.websockets.messages import NotificationWSMessage

@asynccontextmanager
async def lifespan(app: FastAPI):
    await materials.reload()
    await agents.reload()
    yield


config.dictConfig(log_config)

_log = logging.getLogger(__name__)


def app():
    initialize_project_directory()

    app = FastAPI(title="AI Console", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(app_router)

    with resources.path('aiconsole', 'static') as static_path:
        if not static_path.exists():
            _log.warning(f"Static files directory does not exist: {static_path}")
            _log.warning("Static files will not be served")
        else:
            _log.info(f"Static files directory: {static_path}")

            @app.get("/")
            def root():
                with resources.path('aiconsole.static', 'index.html') as index_path:
                    return FileResponse(index_path)

            @app.get("/chats/{chat_id}")
            def chats(chat_id: str):
                with resources.path('aiconsole.static', 'index.html') as index_path:
                    return FileResponse(index_path)
                
            app.mount("/", StaticFiles(directory=static_path))


    def check_for_update():
        _log.info("Checking for updates...")
        if is_update_needed():
            _log.info("Update available - A new version of AI Console is available!")
            asyncio.run(NotificationWSMessage(title="Update available", message="A new version of AI Console is available!").send_to_all())
        else:
            _log.info("No update available")

    threading.Timer(5, check_for_update).start()

    return app
