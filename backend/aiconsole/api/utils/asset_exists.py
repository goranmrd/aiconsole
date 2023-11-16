from aiconsole.core.assets.asset import AssetLocation, AssetType
from aiconsole.core.project import project
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


async def asset_exists(asset_type: AssetType, request: Request, asset_id: str):
    location_param = request.query_params.get("location", None)
    location = AssetLocation(location_param) if location_param else None

    if not location:
        raise HTTPException(status_code=400, detail="Location not specified")

    if asset_id == "new":
        return JSONResponse({"exists": False})
    else:
        if asset_type == AssetType.AGENT:
            assets = project.get_project_agents()
        elif asset_type == AssetType.MATERIAL:
            assets = project.get_project_materials()
        else:
            raise ValueError(f"Invalid asset type: {asset_type}")

        asset = assets.get_asset(asset_id, location)

        return JSONResponse({"exists": asset is not None})
