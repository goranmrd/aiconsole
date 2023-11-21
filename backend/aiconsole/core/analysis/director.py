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

from aiconsole.core.analysis.variant_quality_single_shot import variant_quality_single_shot
from aiconsole.core.chat.types import Chat


async def director_analyse(chat: Chat, analysis_request_id: str):
    return await variant_quality_single_shot(chat, analysis_request_id)
