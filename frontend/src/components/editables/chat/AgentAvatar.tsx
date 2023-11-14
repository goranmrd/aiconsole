import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { useAPIStore } from '@/store/useAPIStore';
import { cn } from '@/utils/common/cn';


export function AgentAvatar({ agent_id, title, type }: { agent_id: string; title?: string; type: 'large' | 'small'; }) {
  const agent = useAssetStore((state) => state.getAsset('agent', agent_id));
  const getBaseURL = useAPIStore((state) => state.getBaseURL);

  let classNames = '';

  if (type === 'large') {
    classNames = "w-20 h-20 rounded-full mb-3  border shadow-md border-slate-800";
  }

  if (type === 'small') {
    classNames = "w-14 h-14 rounded-full mb-3  border shadow-md border-slate-800";
  }

  return (
    <img
      title={title}
      src={`${getBaseURL()}/profile/${agent_id}.jpg`}
      className={cn(classNames, agent?.status === 'forced' && " border-2 border-primary")} />
  );
}
