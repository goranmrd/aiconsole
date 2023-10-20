from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole.agents.types import Agent
from aiconsole.execution_modes.normal import execution_mode_normal
from aiconsole.gpt.consts import GPTMode
from aiconsole.materials.content_evaluation_context import ContentEvaluationContext
from aiconsole.materials.material import Material

router = APIRouter()

@router.post("/preview")
async def materials_preview(material: Material):
    content_context = ContentEvaluationContext(
        messages=[],
        agent=Agent(
            id="user",
            name="User",
            usage="When a human user needs to respond",
            system="",
            execution_mode=execution_mode_normal,
            gpt_mode=GPTMode.QUALITY,
        ),
        gpt_mode=GPTMode.FAST,
        relevant_materials=[],
    )

    rendered_material = await material.render(content_context)

    return JSONResponse(rendered_material.model_dump())
