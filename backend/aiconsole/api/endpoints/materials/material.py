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

from typing import cast
from aiconsole.api.utils.asset_save import asset_patch, asset_post
from aiconsole.core.assets.get_material_content_name import get_material_content_name
from aiconsole.api.utils.asset_exists import asset_exists
from aiconsole.api.utils.asset_get import asset_get
from aiconsole.api.utils.asset_status_change import asset_status_change
from aiconsole.api.utils.status_change_post_body import StatusChangePostBody
from aiconsole.core.assets.asset import AssetLocation, AssetStatus, AssetType
from aiconsole.core.assets.materials.material import Material, MaterialContentType, MaterialWithStatus
from aiconsole.core.project import project
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/{material_id}")
async def material_get(request: Request, material_id: str):
    type = cast(MaterialContentType, request.query_params.get("type", ""))

    return await asset_get(
        request,
        AssetType.MATERIAL,
        material_id,
        lambda: MaterialWithStatus(
            id="",
            name="New " + get_material_content_name(type),
            usage="",
            usage_examples=[],
            status=AssetStatus.ENABLED,
            defined_in=AssetLocation.PROJECT_DIR,
            override=False,
        ),
    )


@router.patch("/{asset_id}")
async def agent_patch(asset_id: str, material: Material):
    return await asset_patch(AssetType.MATERIAL, material, asset_id)


@router.post("/{asset_id}")
async def agent_post(asset_id: str, material: Material):
    return await asset_post(AssetType.MATERIAL, material, asset_id)


@router.post("/{material_id}/status-change")
async def material_status_change(material_id: str, body: StatusChangePostBody):
    return await asset_status_change(AssetType.MATERIAL, material_id, body)


@router.delete("/{material_id}")
async def delete_material(material_id: str):
    try:
        await project.get_project_materials().delete_asset(material_id)
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Material not found")


@router.get("/{asset_id}/exists")
async def material_exists(request: Request, asset_id: str):
    return await asset_exists(AssetType.MATERIAL, request, asset_id)
