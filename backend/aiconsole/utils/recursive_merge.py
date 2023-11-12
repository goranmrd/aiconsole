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

from typing import Dict, Any


def recursive_merge(dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively merge dictionaries."""
    for k, v in dict2.items():
        if k in dict1:
            if isinstance(dict1[k], dict) and isinstance(v, dict):
                recursive_merge(dict1[k], v)
            elif isinstance(dict1[k], list) and isinstance(v, list):
                dict1[k].extend(v)
                dict1[k] = list(set(dict1[k]))
            else:
                dict1[k] = v
        else:
            dict1[k] = v
    return dict1
