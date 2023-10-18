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
          <div className="w-32 opacity-80 text-xs text-center overflow-ellipsis overflow-hidden whitespace-nowrap">
            {material_id}
          </div>
        </Link>
      ))}
    </div>
  );
}
