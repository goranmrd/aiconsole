from aiconsole.core.assets.asset import AssetLocation, AssetType
from aiconsole.core.project import project
from aiconsole.core.project.paths import get_project_assets_directory
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


def asset_path(asset_type: AssetType, request: Request, asset_id: str):
    if asset_type == AssetType.AGENT:
        asset = project.get_project_agents().get_asset(asset_id)
    elif asset_type == AssetType.MATERIAL:
        asset = project.get_project_materials().get_asset(asset_id)
    else:
        raise ValueError(f"Invalid asset type: {asset_type}")

    if asset is None:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} of type {asset_type} not found")

    path = get_project_assets_directory(asset_type) / f"{asset_id}.toml"

    return JSONResponse({"path": str(path)})
