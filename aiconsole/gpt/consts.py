import decimal
from enum import Enum
from typing import Dict, Literal
from pydantic import BaseModel


class GPTModel(str, Enum):
    GPT_4_0613 = "gpt-4-0613"
    GPT_35_TURBO_0613 = "gpt-3.5-turbo-0613"
    GPT_35_TURBO_16k_0613 = "gpt-3.5-turbo-16k-0613"


class GPTMode(str, Enum):
    FAST = "FAST"
    QUALITY = "QUALITY"


class GPTEncoding(str, Enum):
    GPT_4 = "gpt-4"
    GPT_35 = "gpt-3.5-turbo"


GPTEncodingLiteral = Literal[GPTEncoding.GPT_4, GPTEncoding.GPT_35]


class GPTModelData(BaseModel):
    encoding: GPTEncodingLiteral
    max_tokens: int


MODEL_DATA: Dict[str, GPTModelData] = {
    GPTModel.GPT_4_0613: GPTModelData(
        max_tokens=8192,
        encoding=GPTEncoding.GPT_4,
    ),
    GPTModel.GPT_35_TURBO_0613: GPTModelData(
        max_tokens=4096,
        encoding=GPTEncoding.GPT_35,
    ),
    GPTModel.GPT_35_TURBO_16k_0613: GPTModelData(
        max_tokens=16384,
        encoding=GPTEncoding.GPT_35,
    ),
}
