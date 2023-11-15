from aiconsole.api.websockets.outgoing_messages import ErrorWSMessage
from aiconsole.core.assets.asset import Asset, AssetType
from aiconsole.core.assets.fs.load_asset_from_fs import load_asset_from_fs
from aiconsole.core.project.paths import get_core_assets_directory, get_project_assets_directory
from aiconsole.utils.list_files_in_file_system import list_files_in_file_system


import os
from pathlib import Path
from typing import Dict


async def load_all_assets(asset_type: AssetType) -> Dict[str, Asset]:
    _assets = {}

    asset_ids = set([
        os.path.splitext(os.path.basename(path))[0]
        for paths_yielding_function in [
            list_files_in_file_system(get_core_assets_directory(asset_type)),
            list_files_in_file_system(
                get_project_assets_directory(asset_type)),
        ] for path in paths_yielding_function
        if os.path.splitext(Path(path))[-1] == ".toml"
    ])

    for id in asset_ids:
        try:
            _assets[id] = await load_asset_from_fs(asset_type, id)
        except Exception as e:
            await ErrorWSMessage(
                error=f"Invalid {asset_type} {id} {e}",
            ).send_to_all()
            continue

    return _assets
