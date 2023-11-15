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

from aiconsole.api.endpoints.agents.agent import agent_status_change
from aiconsole.api.utils.asset_get import asset_get
from aiconsole.api.utils.status_change_post_body import StatusChangePostBody
from aiconsole.core.assets.asset import AssetLocation, AssetStatus, AssetType
from aiconsole.core.assets.materials.material import Material, MaterialWithStatus
from aiconsole.core.project import project
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/{material_id}")
async def material_get(request: Request, material_id: str):
    return await asset_get(
        request,
        AssetType.MATERIAL,
        material_id,
        lambda location: MaterialWithStatus(
            id="",
            name="",
            usage="",
            usage_examples=[],
            status=AssetStatus.ENABLED,
            defined_in=AssetLocation.PROJECT_DIR,
            override=False,
        ),
    )


@router.patch("/{material_id}")
async def material_patch(material_id: str, material: Material):
    try:
        await project.get_project_materials().save_asset(material, new=False, old_asset_id=material_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return JSONResponse({"status": "ok"})


@router.post("/{material_id}")
async def material_post(material_id: str, material: Material):
    if material_id != material.id:
        raise HTTPException(status_code=400, detail="Material ID mismatch")

    try:
        await project.get_project_materials().save_asset(material, new=True, old_asset_id=material_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return JSONResponse({"status": "ok"})


@router.post("/{material_id}/status-change")
async def material_status_change(material_id: str, body: StatusChangePostBody):
    return agent_status_change(AssetType.MATERIAL, material_id, body)


@router.delete("/{material_id}")
async def delete_material(material_id: str):
    try:
        await project.get_project_materials().delete_asset(material_id)
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Material not found")
