import os
from pathlib import Path
from typing import Dict

from aiconsole.api.websockets.outgoing_messages import ErrorWSMessage
from aiconsole.core.assets.asset import Asset, AssetLocation, AssetType
from aiconsole.core.assets.fs.load_asset_from_fs import load_asset_from_fs
from aiconsole.core.project.paths import get_core_assets_directory, get_project_assets_directory
from aiconsole.utils.list_files_in_file_system import list_files_in_file_system


async def load_all_assets(asset_type: AssetType) -> Dict[str, list[Asset]]:
    _assets = {}

    locations = [
        [AssetLocation.PROJECT_DIR, get_project_assets_directory(asset_type)],
        [AssetLocation.AICONSOLE_CORE, get_core_assets_directory(asset_type)],
    ]

    for [location, dir] in locations:
        ids = set(
            [
                os.path.splitext(os.path.basename(path))[0]
                for path in list_files_in_file_system(dir)
                if os.path.splitext(Path(path))[-1] == ".toml"
            ]
        )

        for id in ids:
            try:
                asset = await load_asset_from_fs(asset_type, id, location)
                if id not in _assets:
                    _assets[id] = []
                _assets[id].append(asset)
            except Exception as e:
                await ErrorWSMessage(
                    error=f"Invalid {asset_type} {id} {e}",
                ).send_to_all()
                continue

    return _assets
