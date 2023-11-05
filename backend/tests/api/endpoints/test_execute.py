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
    
from fastapi.testclient import TestClient
from pytest_mock import MockFixture
from aiconsole.chat.types import ChatWithAgentAndMaterials


# TODO move it to common testing tools
class AsyncIteratorMock:
    def __init__(self, data):
        self.data = data

    def __aiter__(self):
        return self

    async def __anext__(self):
        if len(self.data) == 0:
            raise StopAsyncIteration
        return self.data.pop(0)


def test_gpt_endpoint_streaming(client: TestClient, mocker: MockFixture):
    stream_text = "++RESPONSE++"

    class AgentMock:
        def execution_mode(self, context):  # noqa
            return AsyncIteratorMock([stream_text])

    payload = ChatWithAgentAndMaterials(
        agent_id="test_agent",
        messages=[],
        relevant_materials_ids=[],
        id="test_chat_id",
    )

    mocker.patch("aiconsole.api.endpoints.execute.ExecutionTaskContext")

    mocker.patch.dict(
        "aiconsole.api.endpoints.execute.agents.agents",
        {"test_agent": AgentMock()},
    )

    response = client.post("/execute", json=payload.model_dump())
    assert response.status_code == 200
    assert response.text == stream_text
