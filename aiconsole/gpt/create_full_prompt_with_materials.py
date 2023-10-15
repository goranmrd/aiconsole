from typing import List
from aiconsole.materials.rendered_material import RenderedMaterial


def create_full_prompt_with_materials(
    intro: str,
    materials: List[RenderedMaterial],
    outro: str = ""
):
    section_strs = []
    for material in materials:
        section_strs.append(material.content)

    # Construct the full prompt
    sub_str = "\n\n\n"
    full_prompt = f"{intro}\n\n\n{sub_str.join(section_strs)}\n\n\n{outro}".strip()

    return full_prompt
