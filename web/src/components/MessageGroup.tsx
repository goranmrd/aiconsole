import { AICMessageGroup } from '@/store/types';
import { cn } from '@/utils/styles';
import { MessageSection } from './MessageSection';
import { UserInfo } from './UserInfo';

export function MessageGroup({
  group,
  isStreaming,
}: {
  group: AICMessageGroup;
  isStreaming: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-row shadow-md border-t border-gray-900/50 py-10',
        group.role === 'user' ? 'bg-gray-800/20' : 'bg-gray-700/20',
      )}
    >
      <div className="container flex mx-auto gap-5">
        <UserInfo
          agent_id={group.agent_id}
          materials_ids={group.materials_ids}
          task={group.task}
        />
        <div className="flex-grow flex flex-col gap-5">
          {group.sections.map((section, index) => (
            <MessageSection
              key={section.id}
              messageSection={section}
              isStreaming={index === group.sections.length - 1 && isStreaming}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
