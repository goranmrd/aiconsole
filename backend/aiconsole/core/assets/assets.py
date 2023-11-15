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

import datetime
import logging
from typing import Dict, List, Optional
from aiconsole.core.assets.asset import Asset, AssetLocation, AssetStatus, AssetType
from aiconsole.core.assets.fs.delete_asset_from_fs import delete_asset_from_fs
from aiconsole.core.assets.fs.move_asset_in_fs import move_asset_in_fs
from aiconsole.core.assets.fs.save_asset_to_fs import save_asset_to_fs
from aiconsole.core.assets.load_all_assets import load_all_assets

import watchdog.events
import watchdog.observers
from aiconsole.core.project.paths import get_project_assets_directory
from aiconsole.core.settings.project_settings import get_aiconsole_settings
from aiconsole.utils.BatchingWatchDogHandler import BatchingWatchDogHandler
from aiconsole.api.websockets.outgoing_messages import (AssetsUpdatedWSMessage)

_log = logging.getLogger(__name__)


class Assets:
    _assets: Dict[str, Asset]

    def __init__(self, asset_type: AssetType):
        self._suppress_notification_until = None
        self.asset_type = asset_type
        self._assets = {}

        self.observer = watchdog.observers.Observer()

        get_project_assets_directory(asset_type).mkdir(
            parents=True, exist_ok=True)
        self.observer.schedule(BatchingWatchDogHandler(self.reload),
                               get_project_assets_directory(asset_type),
                               recursive=True)
        self.observer.start()

    def stop(self):
        self.observer.stop()

    def all_assets(self) -> List[Asset]:
        """
        Return all loaded assets.
        """
        return list(self._assets.values())

    def enabled_assets(self) -> List[Asset]:
        """
        Return all enabled loaded materials.
        """
        settings = get_aiconsole_settings()
        return [
            asset for asset in self._assets.values() if
            settings.get_asset_status(self.asset_type, asset.id) in [
                AssetStatus.ENABLED]
        ]

    def forced_assets(self) -> List[Asset]:
        """
        Return all forced loaded materials.
        """
        settings = get_aiconsole_settings()
        return [
            asset for asset in self._assets.values() if
            settings.get_asset_status(self.asset_type, asset.id) in [
                AssetStatus.FORCED]
        ]

    @property
    def assets_project_dir(self) -> Dict[str, Asset]:
        """
        Return all forced loaded materials.
        """
        return {
            material.id: material
            for material in self._assets.values()
            if material.defined_in == AssetLocation.PROJECT_DIR
        }

    @property
    def assets_aiconsole_core(self) -> Dict[str, Asset]:
        """
        Return all forced loaded materials.
        """
        return {
            material.id: material
            for material in self._assets.values()
            if material.defined_in == AssetLocation.AICONSOLE_CORE
        }

    async def save_asset(self, asset: Asset, new: bool, old_asset_id: Optional[str] = None):
        self._assets[asset.id] = await save_asset_to_fs(asset, new, old_asset_id)
        self._suppress_notification()

    def delete_asset(self, asset_id):
        delete_asset_from_fs(self.asset_type, asset_id)
        del self._assets[asset_id]
        self._suppress_notification()

    def move(self, old_asset_id: str, new_asset_id: str) -> None:
        move_asset_in_fs(self.asset_type, old_asset_id, new_asset_id)
        self._suppress_notification()

    def _suppress_notification(self):
        self._suppress_notification_until = datetime.datetime.now() + \
            datetime.timedelta(seconds=10)

    def get_asset(self, name):
        """
        Get a specific asset.
        """
        if name not in self._assets:
            raise KeyError(f"Asset {name} not found")
        return self._assets[name]

    async def reload(self, initial: bool = False):
        _log.info(f"Reloading {self.asset_type}s ...")

        self._assets = await load_all_assets(self.asset_type)

        await AssetsUpdatedWSMessage(
            initial=(initial or not (
                not self._suppress_notification_until or self._suppress_notification_until < datetime.datetime.now())),
            asset_type=self.asset_type,
            count=len(self._assets),
        ).send_to_all()
