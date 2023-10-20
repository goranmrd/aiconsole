from enum import Enum
import traceback
from pydantic import BaseModel
from aiconsole.materials.documentation_from_code import documentation_from_code
from aiconsole.materials.rendered_material import RenderedMaterial
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aiconsole.materials.content_evaluation_context import ContentEvaluationContext


class MaterialStatus(str, Enum):
    DISABLED = "disabled"
    ENABLED = "enabled"
    FORCED = "forced"


class MaterialContentType(str, Enum):
    STATIC_TEXT = "static_text"
    DYNAMIC_TEXT = "dynamic_text"
    API = "api"


class MaterialLocation(str, Enum):
    AICONSOLE_CORE = "aiconsole"
    PROJECT_DIR = "project"


class Material(BaseModel):
    id: str
    name: str
    version: str = "0.0.1"
    usage: str
    defined_in: MaterialLocation
    status: MaterialStatus
    
    # Content, either static or dynamic
    content_type: MaterialContentType = MaterialContentType.STATIC_TEXT
    content_static_text: str = """

# Header

content, content content

## Sub header

Bullets in sub header:
* Bullet 1
* Bullet 2
* Bullet 3

""".strip()
    content_dynamic_text: str = """

import random
    
def content(context):
    samples = ['sample 1' , 'sample 2', 'sample 3', 'sample 4']
    return f'''
# Examples of great content
{random.sample(samples, 2)}

'''.strip()

""".strip()
    content_api: str = """

'''
General API description
'''

def create():
    '''
    Use this function to print 'Created'
    '''
    print "Created"

def list()
    '''
    Use this function to print 'list'
    '''
    print "List"

""".strip()

    async def render(self, context: 'ContentEvaluationContext'):
        header = f"# {self.name}\n\n"

        try:
            if self.content_type == MaterialContentType.DYNAMIC_TEXT:
                # Try compiling the python code and run it
                source_code = compile(
                    self.content_dynamic_text, '<string>', 'exec')
                local_vars = {}
                exec(source_code, local_vars)
                content_func = local_vars.get('content')
                if callable(content_func):
                    return RenderedMaterial(
                    id=self.id,
                    content=header + content_func(context),
                    error=''
                )
                return RenderedMaterial(
                    id=self.id,
                    content='',
                    error='No callable content function found!'
                )
            elif self.content_type == MaterialContentType.STATIC_TEXT:
                return RenderedMaterial(
                    id=self.id,
                    content=header + self.content_static_text,
                    error=''
                )
            elif self.content_type == MaterialContentType.API:
                return RenderedMaterial(
                    id=self.id,
                    content=header + documentation_from_code(self, self.content_api)(context),
                    error=''
                )
        except Exception:
            return RenderedMaterial(id=self.id, content='', error=traceback.format_exc())

        raise ValueError("Material has no content")
