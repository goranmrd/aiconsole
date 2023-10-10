import { Link } from 'react-router-dom';
import { useAICStore } from '../store/AICStore';
import { XMarkIcon, ChatBubbleOvalLeftIcon, TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/solid';
import { cn } from '../utils/styles';
import { v4 as uuidv4 } from 'uuid';
import { useUIStore } from '../store/useUIStore';


const SideBar = () => {
  const isSidebarVisible = useUIStore((state) => state.isSidebarOpened);
  const setIsSidebarVisible = useUIStore((state) => state.setSidebarOpened);

  const chatHeadlines = useAICStore((state) => state.chatHeadlines);
  const chatId = useAICStore((state) => state.chatId);

  function handleDelete(event: React.MouseEvent, id: string) {
      event.stopPropagation();
      event.preventDefault();
    
      if (!window.confirm("Are you sure you want to delete this chat?")) {
          return;
      }
    
      useAICStore.getState().deleteChat(id);
      useAICStore.getState().setChatId(uuidv4());
  }

  return (
    <div
      className={`${
        isSidebarVisible ? 'min-w-[260px] w-[260px] visible' : 'w-0 hidden'
      } bg-gray-900 p-1 drop-shadow-md flex flex-col border-r border-gray-800`}
    >
      <div className='flex items-center p-2 gap-2 border-b-4 border-transparent'>
        <Link to='/' className='text-sm cursor-pointer flex-grow'>
          <button className=' bg-white/5 cursor-pointer w-full hover:bg-white/10 p-2 h-10 rounded-md flex flex-row gap-2 items-center'><PlusIcon className='w-4 h-4'/> New Chat</button>
        </Link>
        
        <button className="bg-white/5 hover:bg-white/10 rounded-md h-10 w-10 p-2 flex items-center justify-center" >
          <XMarkIcon className="h-5 w-5 "  onClick={() => setIsSidebarVisible(false)}/>
        </button>
      </div>
      <div className="overflow-y-auto">
        {chatHeadlines.map((chat) => {
          const selected = chat.id == chatId;
      
          return (
            <Link to={`/chats/${chat.id}`} 
            className={cn("px-2 py-4  hover:bg-gray-800 cursor-pointer flex flex-row gap-3 items-center", selected ? 'bg-gray-800' : '')}
            title={chat.message}
            key={chat.id}>
              <ChatBubbleOvalLeftIcon className="h-4 w-4 flex-none" /><div className="truncate flex-grow"> {chat.message}</div>
              {selected && <><PencilIcon className="h-4 w-4 flex-none" onClick={() => alert('Not implemented')} /><TrashIcon className="h-4 w-4 flex-none" onClick={(e) => handleDelete(e, chat.id)} /></>}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;
