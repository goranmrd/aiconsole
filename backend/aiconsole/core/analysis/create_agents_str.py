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

import random

from aiconsole.core.analysis.agents_to_choose_from import agents_to_choose_from


def create_agents_str() -> str:
    """
    Randomization of agents is done because LLMs have a tendency to overfit to the first few examples.
    """

    # Forced agents if available or enabled agents otherwise
    possible_agent_choices = agents_to_choose_from()

    new_line = "\n"

    random_agents = new_line.join(
        [f"* {c.id} - {c.usage}" for c in random.sample(possible_agent_choices, len(possible_agent_choices))]
    )

    return random_agents
