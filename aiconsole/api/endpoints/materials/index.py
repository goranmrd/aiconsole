import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole import projects

router = APIRouter()

_log = logging.getLogger(__name__)


@router.get("/")
async def materials_get():
    return JSONResponse(
        [
            {
                "id": material.id,"name": material.name,
                "defined_in": material.defined_in,
                "status": material.status,
                "usage": material.usage
            } for material in projects.get_project_materials().all_materials()
        ]
    )
