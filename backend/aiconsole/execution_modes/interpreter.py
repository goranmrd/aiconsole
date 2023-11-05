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
    
import logging
from typing import AsyncGenerator
from aiconsole.agents.types import ExecutionModeContext
from aiconsole.code_running.code_interpreters.language_map import language_map
from aiconsole.execution_modes.get_agent_system_message import get_agent_system_message
from aiconsole.gpt.create_full_prompt_with_materials import create_full_prompt_with_materials
from aiconsole.utils.convert_messages import convert_messages
from openai_function_call import OpenAISchema
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.request import GPTRequest
from aiconsole.gpt.types import CLEAR_STR
from pydantic import Field


_log = logging.getLogger(__name__)

class python(OpenAISchema):
    """
    When you send a message containing Python code to python, it will be executed in a stateful Jupyter notebook environment
    """

    code: str = Field(
        ...,
        description="python code to execute, it will be executed in a stateful Jupyter notebook environment",
        json_schema_extra={"type": "string"}
    )

class shell(OpenAISchema):
    """
    This function executes the given code on the user's system using the local environment and returns the output.
    """

    code: str = Field(..., json_schema_extra={"type": "string"})


class applescript(OpenAISchema):
    """
    This function executes the given code on the user's system using the local environment and returns the output.
    """

    code: str = Field(..., json_schema_extra={"type": "string"})

async def execution_mode_interpreter(
    context: ExecutionModeContext,
) -> AsyncGenerator[str, None]:
    global llm

    system_message = create_full_prompt_with_materials(
        intro=get_agent_system_message(context.agent),
        materials=context.relevant_materials,
    )

    _log.debug(f"System message:\n{system_message}")

    executor = GPTExecutor()

    language = None
    code = ""

    async for chunk in executor.execute(
        GPTRequest(
            system_message=system_message,
            gpt_mode=context.agent.gpt_mode,
            messages=[message for message in convert_messages(
                context.chat)],
            functions=[
                python.openai_schema,
                shell.openai_schema,
                applescript.openai_schema
            ],
            min_tokens=250,
            preferred_tokens=2000
        )
    ):

        if chunk == CLEAR_STR:
            yield CLEAR_STR
            continue

        if ('choices' not in chunk or len(chunk['choices']) == 0):
            continue

        delta = chunk["choices"][0]["delta"]

        if "content" in delta and delta["content"]:
            yield delta["content"]

        function_call = executor.partial_response.choices[0].message.function_call

        if function_call and function_call.arguments:
            # This can now be both a string and a json object

            arguments = function_call.arguments
            languages = language_map.keys()

            if language is None and function_call.name in languages:
                # Languge is in the name of the function call
                language = function_call.name
                yield f'<<<< START CODE ({language}) >>>>'

            if isinstance(arguments, str):
                # We need to handle incorrect OpenAI responses, sometmes arguments is a string containing the code
                if arguments and not arguments.startswith("{"):
                    if language is None:
                        language = "python"
                        yield f'<<<< START CODE ({language}) >>>>'

                    code_delta = arguments[len(code):]
                    code = arguments

                    if code_delta:
                        yield code_delta
            else:
                if arguments and "code" in arguments:
                    if language is None:
                        language = "python"
                        yield f'<<<< START CODE ({language}) >>>>'
                    code_delta = arguments["code"][len(code):]
                    code = arguments["code"]

                    if code_delta:
                        yield code_delta

    if language:
        yield "<<<< END CODE >>>>"
        language = None
