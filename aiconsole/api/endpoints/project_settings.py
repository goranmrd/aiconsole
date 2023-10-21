from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel
from starlette.responses import JSONResponse

from aiconsole.project_settings.settings import Settings

router = APIRouter()


class SettingsPatchData(BaseModel):
    code_autorun: Optional[int] = None


@router.patch("")
async def patch(patch_data: SettingsPatchData):
    settings = Settings()
    settings.patch({settings_name: setting_value for settings_name, setting_value in patch_data if setting_value is not None})
    return JSONResponse({"status": "ok"})


@router.get("")
async def get():
    settings = Settings()
    return JSONResponse(settings.get_settings())

