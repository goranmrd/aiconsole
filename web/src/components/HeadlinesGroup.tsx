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
      <h3 className="uppercase px-6 py-2 text-gray-400 text-xs leading-5">{title}</h3>
      {headlines.map((chat) => {
            const selected = chat.id == currentChatId;

            return (
              <Link
                to={`/chats/${chat.id}`}
                className={cn(
                  ' hover:bg-white/5 px-6 h-full py-3 cursor-pointer flex flex-row gap-3 items-center text-base text-gray-300 leading-[27px]',
                  selected ? 'bg-white/5  font-bold text-white' : '',
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