import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole.materials import materials

router = APIRouter()

_log = logging.getLogger(__name__)

@router.get("/")
async def materials_get():
    if not materials.materials:
        raise ValueError("Materials not initialized")
    
    return JSONResponse(
        [{"id": material.id, "usage": material.usage} for material in materials.materials.materials.values()]
    )
