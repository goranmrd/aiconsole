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

import { getBaseURL } from '@/api/Api';
import { useAssetContextMenu } from '@/hooks/useAssetContextMenu';
import { useProjectContextMenu } from '@/hooks/useProjectContextMenu';
import { useAICStore } from '@/store/AICStore';
import { Agent, Asset, AssetType } from '@/types/types';
import { getAssetColor } from '@/utils/getAssetColor';
import { getAssetIcon } from '@/utils/getAssetIcon';
import { Tooltip } from '@mantine/core';
import React from 'react';
import { Link } from 'react-router-dom';

function EmptyChatAgentAvatar({ agent }: { agent: Agent }) {
  const { showContextMenu } = useAssetContextMenu({ assetType: 'agent', asset: agent });

  return (
    <Tooltip label={`${agent.name}`} position="bottom" transitionProps={{ transition: 'slide-down', duration: 100 }} withArrow >
      <div key={agent.id} className="flex flex-col items-center justify-center">
        <Link
          to={`/agents/${agent.id}`}
          className="inline-block hover:text-secondary"
          onContextMenu={showContextMenu()}
        >
          <img
            src={`${getBaseURL()}/profile/${agent.id}.jpg`}
            className="filter opacity-75 shadows-lg w-20 h-20 mx-auto rounded-full"
            alt="Logo"
          />
        </Link>
      </div>
    </Tooltip>
  );
}

function EmptyChatAssetLink({ assetType, asset }: { assetType: AssetType; asset: Asset }) {
  const { showContextMenu } = useAssetContextMenu({ assetType, asset });

  const Icon = getAssetIcon(asset);
  const color = getAssetColor(asset);

  return (
    <Link to={`/${assetType}s/${asset.id}`} className="inline-block" onContextMenu={showContextMenu()}>
      <div className="hover:text-secondary flex flex-row items-center gap-1 opacity-80 hover:opacity-100">
        <Icon style={{ color }} className="w-4 h-4 inline-block mr-1" />
        {asset.name}
      </div>
    </Link>
  );
}

export const EmptyChat = () => {
  const projectName = useAICStore((state) => state.projectName);
  const agents = useAICStore((state) => state.agents);
  const materials = useAICStore((state) => state.materials || []);
  const { showContextMenu: showProjectContextMenu } = useProjectContextMenu();

  return (
    <section className="flex flex-col items-center justify-center container mx-auto px-6 py-8">
      <h2 className="text-4xl mb-8 text-center font-extrabold mt-20" onContextMenu={showProjectContextMenu()}>
        <p className="p-2">Project</p>
        <span className=" text-primary uppercase">{projectName}</span>
      </h2>
      <div className="font-bold mb-4 text-center opacity-50 text-sm uppercase">Available Agents</div>
      <div className="flex flex-row gap-2 mb-8">
        {agents
          .filter((a) => a.id !== 'user' && a.status !== 'disabled')
          .map((agent) => (
            <EmptyChatAgentAvatar key={agent.id} agent={agent} />
          ))}
      </div>
      <div className="font-bold mb-4 text-center opacity-50 text-sm uppercase">Available Materials</div>
      <div className="text-center">
        {materials
          .filter((m) => m.status !== 'disabled')
          .map((material, index, arr) => (
            <React.Fragment key={material.id}>
              <EmptyChatAssetLink assetType="material" asset={material} />
              {index < arr.length - 1 && <span className="opacity-50">, </span>}
            </React.Fragment>
          ))}
      </div>
    </section>
  );
};
