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
from functools import wraps
import inspect
import logging
import threading
import time
from fastapi import Request
from fastapi.concurrency import run_until_first_complete
from fastapi.responses import StreamingResponse

_log = logging.getLogger(__name__)

def disconnect_aware_generator(original_gen, request):
    client_disconnected = threading.Event()

    # Thread target function to check for client disconnection
    def check_disconnection():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            while not client_disconnected.is_set():
                if loop.run_until_complete(request.is_disconnected()):
                    client_disconnected.set()
                time.sleep(0.5)  # Check every 0.5 seconds
        except Exception:
            pass
        finally:
            loop.close()

    async def async_gen():
        if hasattr(original_gen, '__aiter__'):
            # Asynchronous generator
            async for chunk in original_gen:
                if client_disconnected.is_set():
                    raise asyncio.CancelledError("Client disconnected")
                yield chunk
        else:
            # Synchronous generator
            disconnection_thread = threading.Thread(target=check_disconnection)
            disconnection_thread.start()
            try:
                for chunk in original_gen:
                    if client_disconnected.is_set():
                        raise asyncio.CancelledError("Client disconnected")
                    yield chunk
            finally:
                client_disconnected.set()
                disconnection_thread.join()

    return async_gen()


async def raise_if_disconnected(request: Request):
    while True:
        if await request.is_disconnected():
            raise asyncio.CancelledError("Client disconnected")
        await asyncio.sleep(0.1)  # Check every 0.1 seconds

def cancelable_endpoint(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = kwargs.get('request')
        if not request:
            raise ValueError("The endpoint must have a 'request' argument")
        
        response = None

        async def func_wrapper():
            nonlocal response
            response = await func(*args, **kwargs)

        await run_until_first_complete(
            (func_wrapper, {}),
            (raise_if_disconnected, {"request": request})
        )

        if isinstance(response, StreamingResponse):
            response.body_iterator = disconnect_aware_generator(response.body_iterator, request)

        return response

    return wrapper