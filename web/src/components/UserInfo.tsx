import { useAICStore } from '../store/AICStore';
import { Material } from '../store/types';

export function UserInfo({
  agent_id,
  materials,
}: {
  agent_id: string;
  materials: Material[];
}) {
  const agent = useAICStore((state) => state.getAgent(agent_id));

  return (
    <div className="flex-none items-center flex flex-col">
      {agent && (
        <img
          title={agent.id}
          src={`http://${window.location.hostname}:8000/profile/${agent.id}.jpg`}
          className="w-14 h-14 rounded-full mb-2  border shadow-md border-slate-800"
        />
      )}
      <div
        className="text-xs font-bold w-20 text-center overflow-ellipsis overflow-hidden whitespace-nowrap"
        title={`${agent?.id} - ${agent?.usage}`}
      >
        {agent?.name || agent?.id}
      </div>
      {materials.length > 0 && <div className="text-xs text-center">+</div>}
      {materials.map((material) => (
        <div
          key={material.id}
          className="font-bold w-20 text-xs text-center overflow-ellipsis overflow-hidden whitespace-nowrap"
          title={`id: ${material.id}\nusage: ${material.usage}\ncontent: ${
            material.content.length > 100
              ? material.content.substring(0, 100) + '...'
              : material.content
          }`}
        >
          {material.id}
        </div>
      ))}
    </div>
  );
}
