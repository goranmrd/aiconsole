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

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request

from aiconsole.core.analysis.director import director_analyse
from aiconsole.core.chat.types import Chat
from aiconsole.utils.cancel_on_disconnect import cancelable_endpoint
from aiconsole.api.websockets.outgoing_messages import ErrorWSMessage
from pydantic import BaseModel, ValidationError

router = APIRouter()
_log = logging.getLogger(__name__)


class AnalysisRequestData(BaseModel):
    request_id: str
    chat: Chat


@router.post("/{chat_id}/analyse")
@cancelable_endpoint
async def analyse(request: Request, data: AnalysisRequestData, chat_id):
    if chat_id != data.chat.id:
        raise ValidationError("Chat ID does not match")

    try:
        return await director_analyse(data.chat, data.request_id)
    except asyncio.CancelledError:
        _log.info("Analysis cancelled")
    except Exception as e:
        _log.exception("Analysis failed", exc_info=e)
        raise HTTPException(status_code=400, detail=str(e))
