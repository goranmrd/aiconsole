from aiconsole.core.assets.asset import Asset, AssetType
from aiconsole.core.project import project
from fastapi import HTTPException
from fastapi.responses import JSONResponse


async def asset_post(asset_type: AssetType, asset: Asset, old_asset_id: str):
    try:
        if asset_type == AssetType.AGENT:
            assets = project.get_project_agents()
        elif asset_type == AssetType.MATERIAL:
            assets = project.get_project_materials()
        else:
            raise ValueError(f"Invalid asset type: {asset_type}")

        return JSONResponse({"renamed": await assets.save_asset(asset, old_asset_id=old_asset_id, create=True)})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def asset_patch(asset_type: AssetType, asset: Asset, old_asset_id: str):
    if asset.id != old_asset_id:
        raise HTTPException(status_code=400, detail="Asset ID mismatch")

    try:
        if asset_type == AssetType.AGENT:
            assets = project.get_project_agents()
        elif asset_type == AssetType.MATERIAL:
            assets = project.get_project_materials()
        else:
            raise ValueError(f"Invalid asset type: {asset_type}")

        return await assets.save_asset(asset, old_asset_id=old_asset_id, create=False)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
