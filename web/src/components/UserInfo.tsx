// The AIConsole Project
// 
// Copyright 2023 10Clouds
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Link } from 'react-router-dom';

import { useAICStore } from '@/store/AICStore';

export function UserInfo({
  agent_id,
  materials_ids,
  task,
}: {
  agent_id: string;
  materials_ids: string[];
  task?: string;
}) {
  const agent = useAICStore((state) => state.getAgent(agent_id));

  return (
    <div className="flex-none items-center flex flex-col">
      {agent && (
        <img
          title={`${agent?.name || agent?.id}${
            task ? ` tasked with:\n${task}` : ``
          }`}
          src={`http://${window.location.hostname}:8000/profile/${agent.id}.jpg`}
          className="w-14 h-14 rounded-full mb-3  border shadow-md border-slate-800"
        />
      )}
      <div
        className="text-xs font-bold w-32 text-center overflow-ellipsis overflow-hidden whitespace-nowrap"
        title={`${agent?.id} - ${agent?.usage}`}
      >
        {agent?.name || agent?.id}
      </div>
      {materials_ids.length > 0 && (
        <div className="text-xs opacity-40 text-center">+</div>
      )}
      {materials_ids.map((material_id) => (
        <Link to={`/materials/${material_id}`} key={material_id}>
          <div className="w-32 opacity-80 text-xs text-center overflow-ellipsis overflow-hidden whitespace-nowrap pb-1 px-4" title={material_id}>
            {material_id}
          </div>
        </Link>
      ))}
    </div>
  );
}
