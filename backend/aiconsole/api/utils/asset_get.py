from typing import Callable

from aiconsole.core.assets.asset import Asset, AssetLocation, AssetType
from aiconsole.core.project import project
from aiconsole.core.settings.project_settings import get_aiconsole_settings
from aiconsole.utils.capitalize_first import capitalize_first
from fastapi import HTTPException
from fastapi.responses import JSONResponse


async def asset_get(request, asset_type: AssetType, asset_id: str, new_asset: Callable[[], Asset]):
    location_param = request.query_params.get("location", None)
    location = AssetLocation(location_param) if location_param else None

    if asset_id == "new":
        asset = new_asset()
        asset.defined_in = AssetLocation.PROJECT_DIR
        asset.override = False
        return JSONResponse(asset.model_dump())
    else:
        settings = get_aiconsole_settings()

        if asset_type == AssetType.AGENT:
            assets = project.get_project_agents()
        elif asset_type == AssetType.MATERIAL:
            assets = project.get_project_materials()
        else:
            raise ValueError(f"Invalid asset type: {asset_type}")

        agent = assets.get_asset(asset_id, location)

        if not agent:
            raise HTTPException(status_code=404, detail=f"{capitalize_first(asset_type)} not found")

        # capitalize first letter

        return JSONResponse(
            {
                **agent.model_dump(),
                "status": settings.get_asset_status(asset_type, agent.id),
            }
        )
