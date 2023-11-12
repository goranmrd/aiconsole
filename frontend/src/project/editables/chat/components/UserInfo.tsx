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

import { useEditableObjectContextMenu } from '@/project/editables/common/useEditableObjectContextMenu';
import { useAICStore } from '@/project/editables/chat/AICStore';
import { useOpenSettings } from '@/settings/useOpenSettings';
import { useAPIStore } from '@/common/useAPIStore';
import { useUserContextMenu } from '@/common/contextMenu/useUserContextMenu';

function UserInfoMaterialLink({ material_id }: { material_id: string }) {
  const materials = useAICStore((state) => state.materials) || [];
  const material = materials.find((m) => m.id === material_id);
  const { showContextMenu } = useEditableObjectContextMenu({ editableObjectType: 'material', editableObject: material });

  return (
    <Link to={`/materials/${material_id}`} onContextMenu={showContextMenu()}>
      <div
        className="w-32 opacity-80 text-xs text-center overflow-ellipsis overflow-hidden whitespace-nowrap pb-1 px-4"
        title={material_id}
      >
        {material_id}
      </div>
    </Link>
  );
}

export function UserInfo({
  agent_id,
  materials_ids,
  task,
}: {
  agent_id: string;
  materials_ids: string[];
  task?: string;
}) {
  const agent = useAICStore((state) => state.getAsset('agent', agent_id));
  const getBaseURL = useAPIStore((state) => state.getBaseURL);
  const { showContextMenu } = useEditableObjectContextMenu({
    editableObjectType: 'agent',
    editableObject: agent || {
      id: agent_id,
      name: agent_id
    },
  })

  const { showContextMenu: showUserContextMenu } = useUserContextMenu()
  const openSettings = useOpenSettings();

  return (
    <div className="flex-none items-center flex flex-col">
      {agent && (
        <Link
          to={agent_id != 'user' ? `/agents/${agent_id}` : ''}
          onClick={(e) => {
            if (agent_id == 'user') {
              e.preventDefault()
              openSettings()
            }
          }}
          className="flex-none items-center flex flex-col"
          onContextMenu={agent_id != 'user' ? showContextMenu() : showUserContextMenu()}
        >
          <img
            title={`${agent?.name || agent?.id}${task ? ` tasked with:\n${task}` : ``}`}
            src={`${getBaseURL()}/profile/${agent.id}.jpg`}
            className="w-14 h-14 rounded-full mb-3  border shadow-md border-slate-800"
          />
          <div
            className="text-xs font-bold w-32 text-center overflow-ellipsis overflow-hidden whitespace-nowrap"
            title={`${agent?.id} - ${agent?.usage}`}
          >
            {agent?.name || agent?.id}
          </div>
        </Link>
      )}

      {materials_ids.length > 0 && <div className="text-xs opacity-40 text-center">+</div>}
      {materials_ids.map((material_id) => (
        <UserInfoMaterialLink key={material_id} material_id={material_id} />
      ))}
    </div>
  );
}
