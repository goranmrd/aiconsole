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

import { useEditablesStore } from '@/store/editables/useEditablesStore';
import { Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import { AssetsSidebarTab } from './AssetsSidebarTab';
import { ChatsSidebarTab } from './ChatsSidebarTab';
import { ActiveTab, Tab } from './Tab';

const TABS = [
  { label: 'Chats', key: 'chats' },
  { label: 'Materials', key: 'materials' },
  { label: 'Agents', key: 'agents' },
];

const SideBar = ({ initialTab }: { initialTab: string }) => {
  const agents = useEditablesStore((state) => state.agents);
  const materials = useEditablesStore((state) => state.materials);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

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
          {TABS.map(({ label, key }) => (
            <Tab key={key} value={key} label={label} activeTab={activeTab} />
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
