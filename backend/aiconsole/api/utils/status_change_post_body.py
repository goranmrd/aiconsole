from aiconsole.core.assets.asset import AssetStatus
from pydantic import BaseModel


class StatusChangePostBody(BaseModel):
    status: AssetStatus
    to_global: bool
