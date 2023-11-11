import SideBarItem from '../system/sidebar/SideBarItem';
import { SidebarTabHeader } from '../system/sidebar/SidebarTabHeader';
import { useAICStore } from '@/store/AICStore';

export const AgentsSidebarTab = () => {
  const agents = useAICStore((state) => state.agents);

  return (
    <div>
      <SidebarTabHeader title="Agent" linkTo='/agents/new' />

      <div className="overflow-y-auto flex flex-col gap-[5px] max-h-[calc(100vh-270px)] pr-[15px]">
        {agents.map((agent) => (
          <SideBarItem
            key={agent.id}
            id={agent.id}
            type="agents"
            label={agent.name}
            linkTo={`/agents/${agent.id}`}
            onDelete={() => {}}
          />
        ))}
      </div>
    </div>
  );
};
