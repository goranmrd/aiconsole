import logging
from typing import AsyncGenerator
from aiconsole.aic_types import ExecutionModeContext
from aiconsole.gpt.create_full_prompt_from_sections import create_full_prompt_from_sections
from aiconsole.utils.convert_messages import convert_messages
from typing import AsyncGenerator
from openai_function_call import OpenAISchema
from aiconsole.code_interpreters.language_map import language_map
from aiconsole.gpt.consts import GPTMode
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.request import GPTRequest
from aiconsole.gpt.types import CLEAR_STR
import logging
from pydantic import Field


_log = logging.getLogger(__name__)


class Run(OpenAISchema):
    """
    This function executes the given code on the user's system using the local environment and returns the output.
    """

    lang: str = Field(..., json_schema_extra={"type": "string", "enum": [
        language for language in language_map.keys()
    ]})

    code: str = Field(..., json_schema_extra={"type": "string"})


async def execution_mode_interpreter(
    context: ExecutionModeContext,
) -> AsyncGenerator[str, None]:
    global llm

    system_message = create_full_prompt_from_sections(
        intro=context.agent.system,
        sections=context.relevant_materials,
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
                context.messages)],
            functions=[Run.openai_schema],
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

            # We need to handle incorrect OpenAI responses, sometmes arguments is a string containing the code
            if isinstance(arguments, str):

                if language is None and function_call.name in languages:
                    # Languge is in the name of the function call
                    language = function_call.name
                    yield f'<<<< START CODE ({language}) >>>>'

                if arguments and not arguments.startswith("{"):
                    if language is None:
                        language = "python"
                        yield f'<<<< START CODE ({language}) >>>>'

                    code_delta = arguments[len(code):]
                    code = arguments

                    if code_delta:
                        yield code_delta

            else:
                if language is None and arguments and arguments.get("lang", "") in languages:
                    language = arguments["lang"]
                    yield f'<<<< START CODE ({language}) >>>>'

                if arguments and "code" in arguments:
                    if language is None:
                        language = "python"
                        yield f'<<<< START CODE ({language}) >>>>'
                    code_delta = arguments["code"][len(code):]
                    code = arguments["code"]

                    if code_delta:
                        yield code_delta

    # If the code starts with a !, that means a shell command
    if language == "python" and code.startswith("!"):
        language = "shell"
        # Clear the message and resend it
        yield CLEAR_STR
        yield f'<<<< START CODE ({language}) >>>>'
        yield code[1:]

    if language:
        yield f"<<<< END CODE >>>>"
        language = None
