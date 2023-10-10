import re
from typing import List

from aiconsole.aic_types import StaticMaterial


def create_full_prompt_from_sections(
    intro: str, sections: List[StaticMaterial], outro: str = ""
):
    section_strs = []
    for static_material in sections:
        section_strs.append(f"\n\n{static_material.content}")

    # Construct the full prompt
    sub_str = "\n\n"
    full_prompt = f"{intro}\n\n" f"{sub_str.join(section_strs)}\n\n" f"{outro}".strip()

    return full_prompt
