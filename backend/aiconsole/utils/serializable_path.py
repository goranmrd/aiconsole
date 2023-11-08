from pydantic import PlainSerializer


from pathlib import Path
from typing import Annotated


SerializablePath = Annotated[
    Path, PlainSerializer(lambda x: str(x), return_type=str)
]