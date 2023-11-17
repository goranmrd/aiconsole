import asyncio
from pathlib import Path
from typing import Any, Dict

from aiconsole.core.settings.project_settings import Settings


def set_code_autorun(autorun: bool) -> None:
    settings = Settings(Path("."))
    asyncio.run(settings.reload())
    settings.set_code_autorun(autorun)
    settings.stop()


def get_settings() -> Dict[str, Any]:
    settings = Settings()
    asyncio.run(settings.reload())
    settings.stop()
    return settings.model_dump()
