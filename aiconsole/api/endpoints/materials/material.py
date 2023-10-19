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
            name="",
            usage="",
            defined_in=MaterialLocation.PROJECT_DIR,
        ).model_dump())


@router.post("/{material_id}")
async def material_post(material_id: str, material: Material):
    if material_id != material.id:
        raise ValueError("Material ID mismatch")
    
    projects.get_project_materials().save_material(material)

    return JSONResponse({"status": "ok"})


@router.post("/{material_id}/status-change")
async def material_status_change(
    material_id: str,
):
    """
    Change the status of a material.

    Args:
        material_id (str): The ID of the material.
        status (int): The new status to set (-1 for 'force', 0 for 'disable', 1 for 'enable').

    Returns:
        JSONResponse: JSON response indicating the result.
    """
    try:
        projects.get_project_materials().get_material(material_id)
        projects.get_project_materials().save_material_status(material_id, -1)
        return JSONResponse({"status": "okss"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Material not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{material_id}")
async def delete_material(material_id: str):
    try:
        projects.get_project_materials().delete_material(material_id)
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Material not found")
    