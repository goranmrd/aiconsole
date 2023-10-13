from aiconsole.materials.materials import materials

newline = "\n"
material = {
    "usage": "Contains an index of materials. Do not use if not tasked to list materials or learning about capabilities of this AIConsole instance.",
    "content": lambda context: f'''
# List of Materials

Available materials:
{newline.join(f'{f"* {material.id} - {material.usage}"}' for material in materials.all_materials())}
'''
}
