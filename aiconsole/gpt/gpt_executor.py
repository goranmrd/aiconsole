import asyncio
import logging
import pprint

import litellm
from aiconsole.gpt.partial import GPTPartialResponse

from aiconsole.gpt.request import GPTRequest

from .types import CLEAR_STR, GPTChoice, GPTMessage, GPTResponse

log = logging.getLogger(__name__)

from litellm.caching import Cache
litellm.cache = Cache()
litellm.cache.cache

class GPTExecutor:
    def __init__(self):
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

        log.debug(f"GPT REQUEST:\n{pprint.pformat(request_dict)}")

        for attempt in range(3):
            try:
                response = litellm.completion(
                    **request_dict,
                    stream=True,
                    # caching=True,
                )

                self.partial_response = GPTPartialResponse()

                for chunk in response:
                    self.partial_response.apply_chunk(chunk)
                    yield chunk
                    await asyncio.sleep(0)

                self.response = self.partial_response.to_final_response()

                log.debug(f"GPT RESPONSE:\n{self.response}")

                return
            except Exception as error:
                log.error(f"Error on attempt {attempt}: {error}")
                if attempt == 2:
                    raise error
            yield CLEAR_STR

        raise Exception("Unable to complete GPT request.")
