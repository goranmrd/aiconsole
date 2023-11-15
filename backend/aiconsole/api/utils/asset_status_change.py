from aiconsole.api.utils.status_change_post_body import StatusChangePostBody
from aiconsole.core.assets.asset import AssetType
from aiconsole.core.settings.project_settings import get_aiconsole_settings
from fastapi import HTTPException
from fastapi.responses import JSONResponse


async def asset_status_change(asset_type: AssetType, asset_id: str, body: StatusChangePostBody):
    """
    Change the status of a agent.

    Args:
        agent_id (str): The ID of the agent.
        body (StatusChangePostBody): POST body, only with "status"

    Returns:
        JSONResponse: JSON response indicating the result.
    """
    try:
        get_aiconsole_settings().set_asset_status(
            asset_type, id=asset_id, status=body.status, to_global=body.to_global
        )
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Agent not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
