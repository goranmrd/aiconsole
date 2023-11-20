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

import { TabsValues } from '@/types/editables/assetTypes';
import { useEditablesStore } from '@/store/editables/useEditablesStore';
import { Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import { AssetsSidebarTab } from './AssetsSidebarTab';
import { ChatsSidebarTab } from './ChatsSidebarTab';
import { cn } from '@/utils/common/cn';

const SideBar = ({ initialTab }: { initialTab: string }) => {
  const agents = useEditablesStore((state) => state.agents);
  const materials = useEditablesStore((state) => state.materials);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState<TabsValues | string | null>(initialTab);

  const tabs = [
    { label: 'Chats', key: 'chats' },
    { label: 'Materials', key: 'materials' },
    { label: 'Agents', key: 'agents' },
  ];

  return (
    <div
      className={`min-w-[336px] w-[336px] h-full  bg-gray-900 pl-[30px] py-[20px] drop-shadow-md flex flex-col border-r  border-gray-600 `}
    >
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        color="#F1FF99"
        classNames={{
          list: 'before:border-gray-500',
        }}
      >
        <Tabs.List grow justify="center" className="mb-[15px] mr-[30px]">
          {tabs.map(({ label, key }) => (
            <Tabs.Tab
              value={key}
              key={key}
              className={cn(
                'px-[26px] pt-[10px] pb-[25px] [&:first-letter:] tab-hover font-medium text-[14px] w-1/3 hover:bg-transparent overflow-hidden',
                {
                  'text-white after:blur-[15px] after:opacity-20 after:w-[40px] after:h-[30px] after:absolute after:bottom-[-8px] after:z-[99] after:bg-yellow':
                    activeTab === key,
                },
              )}
            >
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="chats">
          <ChatsSidebarTab />
        </Tabs.Panel>
        <Tabs.Panel value="materials">
          <AssetsSidebarTab assetType="material" assets={materials || []} />
        </Tabs.Panel>
        <Tabs.Panel value="agents">
          <AssetsSidebarTab assetType="agent" assets={agents} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default SideBar;
