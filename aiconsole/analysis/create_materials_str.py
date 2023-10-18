from aiconsole import projects


import random


def create_materials_str() -> str:
    new_line = "\n"

    available_materials = projects.get_project_materials().all_materials()

    random_materials = (
        new_line.join(
            [
                f"* {c.id} - {c.usage}"
                for c in random.sample(available_materials, len(available_materials))
            ]
        )
        if available_materials
        else ""
    )

    return random_materials