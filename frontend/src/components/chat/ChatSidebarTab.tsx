import useGroupByDate from '@/hooks/useGroupByDate';
import { useAICStore } from '@/store/AICStore';
import { v4 as uuidv4 } from 'uuid';
import HeadlinesGroup from './HeadlinesGroup';
import { SidebarTabHeader } from '../system/sidebar/SidebarTabHeader';

export const ChatSidebarTab = () => {
  const chatHeadlines = useAICStore((state) => state.chatHeadlines);
  const chatId = useAICStore((state) => state.chatId);
  const { today, yesterday, previous7Days, older } = useGroupByDate(chatHeadlines);

  function handleDelete(event: React.MouseEvent, id: string) {
    event.stopPropagation();
    event.preventDefault();

    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    useAICStore.getState().deleteChat(id);
    useAICStore.getState().setChatId(uuidv4());
  }

  const handleHeadlineChange = (chatId: string, newHeadline: string) => {
    useAICStore.getState().updateChatHeadline(chatId, newHeadline);
  };

  return (
    <div>
      <SidebarTabHeader title="Chat" linkTo={`/chats/${uuidv4()}`} />
      <div className="overflow-y-auto flex flex-col gap-[5px] max-h-[calc(100vh-270px)] pr-[15px]">
        {!!today.length && (
          <HeadlinesGroup
            title="Today"
            headlines={today}
            currentChatId={chatId}
            onChatDelete={handleDelete}
            onHeadlineChange={handleHeadlineChange}
          />
        )}
        {!!yesterday.length && (
          <HeadlinesGroup
            title="Yesterday"
            headlines={yesterday}
            currentChatId={chatId}
            onChatDelete={handleDelete}
            onHeadlineChange={handleHeadlineChange}
          />
        )}
        {!!previous7Days.length && (
          <HeadlinesGroup
            title="Previous 7 days"
            headlines={previous7Days}
            currentChatId={chatId}
            onChatDelete={handleDelete}
            onHeadlineChange={handleHeadlineChange}
          />
        )}
        {!!older.length && (
          <HeadlinesGroup
            title="Older than 7 days"
            headlines={older}
            currentChatId={chatId}
            onChatDelete={handleDelete}
            onHeadlineChange={handleHeadlineChange}
          />
        )}
      </div>
    </div>
  );
};
