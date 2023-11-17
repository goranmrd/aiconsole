from aiconsole.core.assets.materials.material import MaterialContentType


def get_material_content_name(content_type: MaterialContentType):
    if content_type == "static_text":
        return "Note"
    elif content_type == "dynamic_text":
        return "Dynamic Note"
    elif content_type == "api":
        return "Python API"
    else:
        return "Material"
