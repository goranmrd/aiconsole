import logging
from typing import AsyncGenerator
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole import projects
from aiconsole.gpt.consts import GPTMode
from aiconsole.materials import materials
from aiconsole.aic_types import Agent, ContentEvaluationContext, StaticMaterial

router = APIRouter()

_log = logging.getLogger(__name__)

@router.get("/{material_id}")
async def material_get(material_id: str):
    if material_id not in projects.get_project_materials().materials:
        return JSONResponse(StaticMaterial(
            id="",
            usage="",
            content="",
        ).model_dump())
    

    material = projects.get_project_materials().materials[material_id]

    fake_parameter: ContentEvaluationContext = ContentEvaluationContext(
        messages=[],
        agent=Agent(
            id="",
            name="",
            usage="",
            system="",
            execution_mode=lambda x: AsyncGenerator(),
            gpt_mode=GPTMode.QUALITY,
        ),
        gpt_mode=GPTMode.QUALITY,
        relevant_materials=[]
    )

    return JSONResponse(StaticMaterial(
        id= material.id,
        usage= material.usage,
        content= material.content(fake_parameter),
    ).model_dump())


@router.post("/{material_id}")
async def material_post(material_id: str, material: StaticMaterial):
    projects.get_project_materials().save_static(material)

    return JSONResponse({"status": "ok"})