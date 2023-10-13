import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole.materials import materials
from aiconsole.aic_types import StaticMaterial

router = APIRouter()

_log = logging.getLogger(__name__)

@router.get("/{material_id}")
async def material_get(material_id: str):
    if not materials.materials:
        raise ValueError("Materials not initialized")

    material = materials.materials.materials[material_id]

    return JSONResponse(StaticMaterial(
        id= material.id,
        usage= material.usage,
        content= material.content({}),
    ).model_dump())


@router.post("/{material_id}")
async def material_post(material_id: str, material: StaticMaterial):
    if not materials.materials:
        raise ValueError("Materials not initialized")

    materials.materials.save_static(material)

    return JSONResponse({"status": "ok"})