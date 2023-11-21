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

import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { useEditablesStore } from '@/store/editables/useEditablesStore';
import { useUserContextMenu } from '@/utils/common/useUserContextMenu';
import { useEditableObjectContextMenu } from '@/utils/editables/useContextMenuForEditable';
import { AgentAvatar } from './AgentAvatar';

function UserInfoMaterialLink({ materialId }: { materialId: string }) {
  const materials = useEditablesStore((state) => state.materials) || [];
  const material = materials.find((m) => m.id === materialId);
  const { showContextMenu } = useEditableObjectContextMenu({ editableObjectType: 'material', editable: material });

  return (
    <Link to={`/materials/${materialId}`} onContextMenu={showContextMenu()}>
      <div
        className="w-32 opacity-80 text-xs text-center overflow-ellipsis overflow-hidden whitespace-nowrap pb-1 px-4"
        title={materialId}
      >
        {materialId}
      </div>
    </Link>
  );
}

export function UserInfo({ agentId, materialsIds, task }: { agentId: string; materialsIds: string[]; task?: string }) {
  const agent = useAssetStore((state) => state.getAsset('agent', agentId));
  const { showContextMenu } = useEditableObjectContextMenu({
    editableObjectType: 'agent',
    editable: agent || {
      id: agentId,
      name: agentId,
    },
  });

  const { showContextMenu: showUserContextMenu } = useUserContextMenu();

  return (
    <div className="flex-none items-center flex flex-col">
      <Link
        to={agentId != 'user' ? `/agents/${agentId}` : ''}
        onClick={agentId != 'user' ? showContextMenu() : showUserContextMenu()}
        className="flex-none items-center flex flex-col"
        onContextMenu={agentId != 'user' ? showContextMenu() : showUserContextMenu()}
      >
        <AgentAvatar
          agent_id={agentId}
          title={`${agent?.name || agentId}${task ? ` tasked with:\n${task}` : ``}`}
          type="small"
        />
        <div
          className="text-xs font-bold w-32 text-center overflow-ellipsis overflow-hidden whitespace-nowrap"
          title={`${agent?.id} - ${agent?.usage}`}
        >
          {agent?.name || agent?.id}
        </div>
      </Link>

      {materialsIds.length > 0 && <div className="text-xs opacity-40 text-center">+</div>}
      {materialsIds.map((material_id) => (
        <UserInfoMaterialLink key={material_id} materialId={material_id} />
      ))}
    </div>
  );
}
