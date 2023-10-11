import { Link } from "react-router-dom";
import { ChatHeadline } from "../store/types"
import { cn } from "../utils/styles";
import { TrashIcon, PencilIcon } from '@heroicons/react/24/solid';

export type HeadlinesGroupProps = {
  title: string,
  headlines: ChatHeadline[];
  currentChatId: string;
  onChatDelete: (e: React.MouseEvent, id: string) => void
}

const HeadlinesGroup = ({title, headlines, currentChatId, onChatDelete}: HeadlinesGroupProps) => {
  return (
    <>
      <h3 className="p-2 text-slate-400">{title}</h3>
      {headlines.map((chat) => {
            const selected = chat.id == currentChatId;

            return (
              <Link
                to={`/chats/${chat.id}`}
                className={cn(
                  ' hover:bg-white/5 px-6 h-full py-3 cursor-pointer flex flex-row gap-3 items-center',
                  selected ? 'bg-white/5  font-bold' : '',
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
                      onClick={(e) => onChatDelete(e, chat.id)}
                    />
                  </>
                )}
              </Link>
            );
          })}
    </>
  )
}
export default HeadlinesGroup