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

from aiconsole.core.gpt.consts import MODEL_DATA
import litellm

# Verify the OpenAI key has access to the required models
def check_key(key: str) -> bool:
    models = MODEL_DATA.keys()
    for model in models:
        if not litellm.check_valid_key(model=model, api_key=key):
            return False

    return True