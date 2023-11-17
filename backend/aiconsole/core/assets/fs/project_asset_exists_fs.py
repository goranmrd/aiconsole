from aiconsole.core.assets.asset import AssetType
from aiconsole.core.project.paths import get_project_assets_directory


def project_asset_exists_fs(asset_type: AssetType, asset_id: str) -> bool:
    return (get_project_assets_directory(asset_type) / f"{asset_id}.toml").exists()
