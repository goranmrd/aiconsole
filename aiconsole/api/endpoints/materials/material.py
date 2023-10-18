import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from aiconsole import projects
from aiconsole.materials.material import MaterialLocation, Material

router = APIRouter()

_log = logging.getLogger(__name__)

@router.get("/{material_id}")
async def material_get(material_id: str):
    try:
        material = projects.get_project_materials().get_material(material_id)
        return JSONResponse(material.model_dump())
    except KeyError:
        #A new material
        return JSONResponse(Material(
            id="",
            usage="",
            defined_in=MaterialLocation.PROJECT_DIR,
        ).model_dump())

@router.post("/{material_id}")
async def material_post(material_id: str, material: Material):
    if material_id != material.id:
        raise ValueError("Material ID mismatch")
    
    projects.get_project_materials().save_material(material)

    return JSONResponse({"status": "ok"})

@router.delete("/{material_id}")
async def delete_material(material_id: str):
    try:
        projects.get_project_materials().delete_material(material_id)
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Material not found")
    