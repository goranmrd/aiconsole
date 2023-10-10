import { AICMessageGroup } from '../store/types';
import { cn } from '../utils/styles';
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
        'flex flex-row shadow-md border-t border-gray-900/50 p-5',
        group.role === 'user' ? 'bg-transparent' : 'bg-[#FFFFFF10]',
      )}
    >
      <div className="container flex mx-auto gap-4">
        <UserInfo agent_id={group.agent_id} materials={group.materials} />
        <div className="flex-grow flex flex-col gap-5">
          {group.task && <h3 className='font-bold italic'>Task: {group.task}</h3> }
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
