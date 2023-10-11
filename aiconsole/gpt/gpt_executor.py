import asyncio
import logging

import litellm
from aiconsole.gpt.partial import GPTPartialResponse

from aiconsole.gpt.request import GPTRequest
from aiconsole.websockets.messages import DebugJSONWSMessage

from .types import CLEAR_STR, GPTChoice, GPTMessage, GPTResponse

_log = logging.getLogger(__name__)

from litellm.caching import Cache
litellm.cache = Cache()
litellm.cache.cache

class GPTExecutor:
    def __init__(self):
        self.request = {}
        self.response = GPTResponse(
            choices = [
                GPTChoice(
                    index = 0,
                    message = GPTMessage(
                        role = "assistant",
                        content = "Hello, how can I help you?"
                    ),
                    finnish_reason = ""
                )
            ]
        )
        self.partial_response = GPTPartialResponse()

    async def execute(self, request: GPTRequest):
        request.validate_request()

        request_dict = {
            "function_call": request.function_call,
            "functions": request.functions,
            "max_tokens": request.max_tokens,
            "messages": request.get_messages_dump(),
            "model": request.model,
            "temperature": request.temperature,
            "presence_penalty": request.presence_penalty,
        }

        for attempt in range(3):
            try:
                self.request = request_dict
                response = await litellm.acompletion(
                    **request_dict,
                    stream=True,
                    # caching=True,
                )

                self.partial_response = GPTPartialResponse()

                async for chunk in response: # type: ignore - for some reason response is not recognized as an async generator
                    self.partial_response.apply_chunk(chunk)
                    yield chunk
                    await asyncio.sleep(0)

                self.response = self.partial_response.to_final_response()

                
                if _log.isEnabledFor(logging.DEBUG):
                    await DebugJSONWSMessage(message="GPT", object={
                        'request': self.request,
                        'response': self.response.model_dump()
                    }).send_to_all()

                return
            except Exception as error:
                _log.error(f"Error on attempt {attempt}: {error}")
                if attempt == 2:
                    raise error
            yield CLEAR_STR

        raise Exception("Unable to complete GPT request.")
