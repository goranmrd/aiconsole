from aiconsole import projects


from openai_function_call import OpenAISchema
from pydantic import Field


import random
from typing import List


def create_plan_class():
    available_materials = projects.get_project_materials().available_materials()
    available_agents = projects.get_project_agents().all_agents()

    class Plan(OpenAISchema):

        """
        Plan what should happen next.
        """

        thinking_process: str = Field(
            description="Short description of the thinking process that led to the next step.",
            json_schema_extra={"type": "string"}
        )

        next_step: str = Field(
            description="A short actionable description of the next single atomic task to move this conversation forward.",
            json_schema_extra={"type": "string"}
        )

        is_users_turn: bool = Field(
            ...,
            description="Whether the initiative is on the user side or on assistant side.",
            json_schema_extra={"type": "boolean"}
        )

        agent_id: str = Field(
            description="Chosen agent to perform the next step.",
            json_schema_extra={"enum": [s.id for s in random.sample(
                available_agents, len(available_agents))]},
        )

        relevant_material_ids: List[str] = Field(
            ...,
            description="Chosen material ids relevant for the task",
            json_schema_extra={
                "items": {"enum": [k.id for k in random.sample(available_materials, len(available_materials))], "type": "string"}
            },
        )

        already_happened: bool = Field(
            ...,
            description="True if what is described in the 'next_step' have already happened during this conversation.",
            json_schema_extra={"type": "boolean"}
        )

    return Plan