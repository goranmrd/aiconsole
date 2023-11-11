# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from enum import Enum
from typing import Dict, Literal
from pydantic import BaseModel


class GPTModel(str, Enum):
    GPT_4_0613 = "gpt-4-0613"
    GPT_35_TURBO_0613 = "gpt-3.5-turbo-0613"
    GPT_35_TURBO_16k_0613 = "gpt-3.5-turbo-16k-0613"
    GPT_4_11106_PREVIEW =  "gpt-4-1106-preview"


class GPTMode(str, Enum):
    COST = "cost"
    SPEED = "speed"
    QUALITY = "quality"


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
    GPTModel.GPT_4_11106_PREVIEW: GPTModelData(
        max_tokens=128000,
        encoding=GPTEncoding.GPT_4,
    ),
}
