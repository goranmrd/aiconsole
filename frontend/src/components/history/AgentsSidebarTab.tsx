import { Tabs } from '@mantine/core';
import SideBarItem from './SideBarItem';
import { SidebarTabHeader } from './SidebarTabHeader';

export const AgentsSidebarTab = () => {
  return (
    <Tabs.Panel value="agents">
      <div>
        <SidebarTabHeader title="Agent" onClick={() => {}} />

        <div className="overflow-y-auto flex flex-col gap-[5px] max-h-[calc(100vh-270px)] pr-[15px]">
          <SideBarItem
            active={false}
            id="0"
            type="agents"
            label="domain_availability"
            onDelete={() => {}}
          />
        </div>
      </div>
    </Tabs.Panel>
  );
};
