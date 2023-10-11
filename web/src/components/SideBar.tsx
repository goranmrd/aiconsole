import { Link } from 'react-router-dom';
import { useAICStore } from '../store/AICStore';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/styles';
import { v4 as uuidv4 } from 'uuid';

const SideBar = () => {
  const chatHeadlines = useAICStore((state) => state.chatHeadlines);
  const chatId = useAICStore((state) => state.chatId);

  function handleDelete(event: React.MouseEvent, id: string) {
    event.stopPropagation();
    event.preventDefault();

    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    useAICStore.getState().deleteChat(id);
    useAICStore.getState().setChatId(uuidv4());
  }

  return (
    <div
      className={`min-w-[240px] w-[240px] h-full bg-gray-900/30 p-1 drop-shadow-md flex flex-col border-r border-white/10`}
    >
        <Link
          to="/"
          className="cursor-pointer p-6 flex font-bold text-sm"
        >
          <button className=" bg-white/5 w-full hover:bg-white/10 p-2 h-10 rounded-full flex flex-row gap-2 items-center border border-white/10 pl-3 pr-2">
            <span className="flex-grow text-left">New Chat</span>{' '}
            <PlusIcon className="w-5 h-5" />
          </button>
        </Link>
        <div className="overflow-y-auto flex flex-col text-sm">
          {chatHeadlines.map((chat) => {
            const selected = chat.id == chatId;

            return (
              <Link
                to={`/chats/${chat.id}`}
                className={cn(
                  ' hover:bg-white/5 px-6 h-full py-3 cursor-pointer flex flex-row gap-3 items-center',
                  selected ? 'bg-white/5 text-white  font-bold' : '',
                )}
                title={chat.message}
                key={chat.id}
              >
                <div className="truncate flex-grow"> {chat.message}</div>
                {selected && (
                  <>
                    <PencilIcon
                      className="h-4 w-4 flex-none"
                      onClick={() => alert('Not implemented')}
                    />
                    <TrashIcon
                      className="h-4 w-4 flex-none"
                      onClick={(e) => handleDelete(e, chat.id)}
                    />
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>
  );
};

export default SideBar;
