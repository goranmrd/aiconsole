from enum import Enum
from typing import Optional
from pydantic import BaseModel
from aiconsole.materials.rendered_material import RenderedMaterial
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aiconsole.materials.content_evaluation_context import ContentEvaluationContext

class MaterialStatus(str, Enum):
    DISABLED = "disabled"
    ENABLED = "enabled"
    FORCED = "forced"

class MaterialContentType(str, Enum):
    STATIC_TEXT = "static"
    PYTHON_GENERATOR = "python"

class MaterialLocation(str, Enum):
    AICONSOLE_CORE = "core"
    PROJECT_DIR = "project"

class Material(BaseModel):
    id: str
    usage: str
    defined_in: MaterialLocation
    status: MaterialStatus = MaterialStatus.ENABLED
    
    # Python code that should be run prior any code execution
    python_module: Optional[str] = None
    python_code: Optional[str] = None
    
    # Content, either static or dynamic
    content_type: MaterialContentType = MaterialContentType.STATIC_TEXT
    content_source: str = ""

    async def content(self, context: 'ContentEvaluationContext'):
        if self.content_type == MaterialContentType.PYTHON_GENERATOR:
            try:
                # Try compiling the python code and run it
                source_code = compile(self.content_source, '<string>', 'exec')
                local_vars = {}
                exec(source_code, local_vars)
                content_func = local_vars.get('content')
                if callable(content_func):
                    return content_func(context)
                else:
                    raise Exception('No callable content function found!')
            except Exception as e:
                # If there is any error while compiling or running the code, return an empty string
                # and add log (or notify about error).
                raise Exception(f'Error in content source: {e}')
        elif self.content_type == MaterialContentType.STATIC_TEXT:
            return self.content_source
        else:
            raise ValueError("Material has no content")
        
    async def render(self, context: 'ContentEvaluationContext'):
        content = await self.content(context)
        return RenderedMaterial(id=self.id, content=content)

