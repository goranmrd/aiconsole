import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ChatHeadline } from '@/types/types';
import { cn } from '@/utils/styles';
import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

export type HeadlinesGroupProps = {
  title: string;
  headlines: ChatHeadline[];
  currentChatId: string;
  onChatDelete: (e: React.MouseEvent, id: string) => void;
  onHeadlineChange: (chatId: string, newHeadline: string) => void;
};

const HeadlinesGroup = ({
  title,
  headlines,
  currentChatId,
  onChatDelete,
  onHeadlineChange,
}: HeadlinesGroupProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleLinkClick = (chatId: string) => {
    if (chatId !== currentChatId && isEditMode) {
      setIsEditMode(false);
      setInputText('');
    }
  };

  const onChatEdit = (message: string) => {
    setIsEditMode(true);
    setInputText(message);
  };

  const OnAccept = (chatId: string) => {
    onHeadlineChange(chatId, inputText);
    setIsEditMode(false);
  };

  return (
    <>
      <h3 className="uppercase px-6 py-2 text-gray-400 text-xs leading-5">
        {title}
      </h3>
      {headlines.map((chat) => {
        const selected = chat.id == currentChatId;

        return (
          <Link
            to={`/chats/${chat.id}`}
            onClick={() => handleLinkClick(chat.id)}
            className={cn(
              ' hover:bg-white/5 px-6 h-full py-3 cursor-pointer flex flex-row gap-3 items-center text-base text-gray-300 leading-[27px]',
              selected ? 'bg-white/5 font-bold text-white' : '',
            )}
            title={chat.message}
            key={chat.id}
          >
            {isEditMode && selected ? (
              <div className="flex gap-2 w-full">
                <input
                  className="font-normal outline-1 outline-white/20 ring-secondary/30 bg-black resize-none overflow-hidden rounded-lg outline focus:outline-none focus:ring-2"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="flex-grow flex items-center gap-2">
                  <CheckIcon
                    className="h-4 w-4"
                    onClick={() => OnAccept(chat.id)}
                  />
                  <XMarkIcon
                    className="h-4 w-4"
                    onClick={() => setIsEditMode(false)}
                  />
                </div>
              </div>
            ) : (
              <div className="truncate flex-grow">{chat.message}</div>
            )}
            {selected && !isEditMode && (
              <>
                <PencilIcon
                  className="h-4 w-4 flex-none"
                  onClick={() => onChatEdit(chat.message)}
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
  );
};
export default HeadlinesGroup;
