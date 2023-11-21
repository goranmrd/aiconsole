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

from aiconsole.core.assets.asset import AssetType
from pydantic import BaseModel


class BaseWSMessage(BaseModel):
    def get_type(self):
        return self.__class__.__name__

    def send_to_chat(self, chat_id: str):
        from aiconsole.api.websockets.connection_manager import send_message_to_chat

        return send_message_to_chat(chat_id, self)

    def send_to_all(self):
        from aiconsole.api.websockets.connection_manager import send_message_to_all

        return send_message_to_all(self)

    def model_dump(self):
        # Don't include None values, call to super to avoid recursion
        return {k: v for k, v in super().model_dump().items() if v is not None}


class NotificationWSMessage(BaseWSMessage):
    title: str
    message: str


class DebugJSONWSMessage(BaseWSMessage):
    message: str
    object: dict


class ErrorWSMessage(BaseWSMessage):
    error: str


class InitialProjectStatusWSMessage(BaseWSMessage):
    project_name: str | None = None
    project_path: str | None = None


class ProjectOpenedWSMessage(BaseWSMessage):
    name: str
    path: str


class ProjectClosedWSMessage(BaseWSMessage):
    pass


class ProjectLoadingWSMessage(BaseWSMessage):
    pass


class AssetsUpdatedWSMessage(BaseWSMessage):
    initial: bool
    asset_type: AssetType
    count: int


class SettingsWSMessage(BaseWSMessage):
    initial: bool
