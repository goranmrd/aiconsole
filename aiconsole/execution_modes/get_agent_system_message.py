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
    

def get_agent_system_message(agent):
    """
    Add common system message to all agent messages
    """

    return f"""
{agent.system}

When asked to display images, display them by outputing: ![image info](./pictures/image.png) in plain text, no function call required for displaying.

You are part of AIConsole multi-agent system that:
- write any text on an expert level.
- can perform any task.
- can execute code in user's local environment, and has full access to the file system.
- the executed code have full internet access.



""".strip()