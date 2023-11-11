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

from aiconsole.core.assets.asset import AssetLocation, AssetStatus
from aiconsole.core.assets.materials.material import (Material,
                                                      MaterialWithStatus)
from aiconsole.core.project import project
from aiconsole.core.settings.project_settings import get_aiconsole_settings
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()

class StatusChangePostBody(BaseModel):
    status: AssetStatus
    to_global: bool


@router.get("/{material_id}")
async def material_get(material_id: str):
    try:
        settings = get_aiconsole_settings()
        material = project.get_project_materials().get_asset(material_id)
        return JSONResponse({
            **material.model_dump(),
            "status": settings.get_asset_status(material.id),
        })
    except KeyError:
        # A new material
        return JSONResponse(MaterialWithStatus(
            id="",
            name="",
            usage="",
            status=AssetStatus.ENABLED,
            defined_in=AssetLocation.PROJECT_DIR,
        ).model_dump())


@router.patch("/{material_id}")
async def material_patch(material_id: str, material: Material):
    try:
        await project.get_project_materials().save_asset(material, new=False, old_asset_id=material_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return JSONResponse({"status": "ok"})


@router.post("/{material_id}")
async def material_post(material_id: str, material: Material):
    try:
        await project.get_project_materials().save_asset(material, new=True, old_asset_id=material_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return JSONResponse({"status": "ok"})


@router.post("/{material_id}/status-change")
async def material_status_change(
    material_id: str,
    body: StatusChangePostBody
):
    """
    Change the status of a material.

    Args:
        material_id (str): The ID of the material.
        body (StatusChangePostBody): POST body, only with "status"

    Returns:
        JSONResponse: JSON response indicating the result.
    """
    try:
        project.get_project_materials().get_asset(material_id)
        get_aiconsole_settings().set_material_status(
            material_id=material_id, status=body.status, to_global=body.to_global
        )
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Material not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{material_id}")
async def delete_material(material_id: str):
    try:
        project.get_project_materials().delete_asset(material_id)
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Material not found")
