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

import { Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ChatsSidebarTab } from './ChatsSidebarTab';
import { AssetsSidebarTab } from './AssetsSidebarTab';
import { TabsValues } from '@/types/types';
import { useAICStore } from '@/store/AICStore';

/*
  CONFLICTED MERGE

  const chatHeadlines = useAICStore((state) => state.chatHeadlines);
  const chatId = useAICStore((state) => state.chatId);

  const { today, yesterday, previous7Days, older } =
    useGroupByDate(chatHeadlines);

  function handleDelete(event: React.MouseEvent, id: string) {
    event.stopPropagation();
    event.preventDefault();

    useAICStore.getState().deleteChat(id);
    useAICStore.getState().setChatId(uuidv4());
  }

  const handleHeadlineChange = (chatId: string, newHeadline: string) => {
    useAICStore.getState().updateChatHeadline(chatId, newHeadline);
  };
*/

const SideBar = ({initialTab}: {initialTab: string}) => {
  const agents = useAICStore((state) => state.agents);
  const materials = useAICStore((state) => state.materials);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState<TabsValues | string | null>(
    initialTab,
  );

  return (
    <div
      className={`min-w-[336px] w-[336px] h-full max-h-full overflow-y-scroll bg-gray-900 pl-[30px] py-[20px] drop-shadow-md flex flex-col border-r border-gray-600`}
    >
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        color="#F1FF99"
        classNames={{
          tab: 'px-[26px] py-[10px] [&:first-letter:] tab-hover font-medium',
        }}
        vars={() => ({
          root: {},
          list: { '--_tab-border-color': '#3E3E3E' },
          tab: {
            '--mantine-spacing-xs': '10px 0px',
            '--mantine-spacing-md': '25px 0px',
            '--mantine-font-size-sm': '14px',
            '--_tab-hover-color': 'transparent',
          },
        })}
      >
        <Tabs.List grow justify="center" className="mb-[15px] mr-[30px]">
          <Tabs.Tab value="chats">Chats</Tabs.Tab>
          <Tabs.Tab value="materials">Materials</Tabs.Tab>
          <Tabs.Tab value="agents">Agents</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="chats">
        <ChatsSidebarTab />
        </Tabs.Panel>
        <Tabs.Panel value="materials">
          <AssetsSidebarTab assetType='material' assets={materials || []} />
        </Tabs.Panel>
        <Tabs.Panel value="agents">
          <AssetsSidebarTab assetType='agent' assets={agents} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default SideBar;
