import { useState } from 'react';

import { AICMessageSection } from '@/store/types';
import { Message } from './Message';
import { Spinner } from '@/components/Spinner';
import { MessageControls } from './MessageControls';
import { useAICStore } from '@/store/AICStore';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

interface MessageProps {
  messageSection: AICMessageSection;
  isStreaming: boolean;
}

export function MessageSection({ messageSection, isStreaming }: MessageProps) {
  const removeMessage = useAICStore((state) => state.removeMessage);

  const [folded, setFolded] = useState(messageSection.foldable);

  const messageComponents = messageSection.messages.map((message, index) => (
    <Message
      key={message.id}
      message={message}
      isStreaming={index === messageSection.messages.length - 1 && isStreaming}
    />
  ));

  const handleRemoveClick = () => {
    for (const message of messageSection.messages) {
      removeMessage(message.id);
    }
  };

  if (messageSection.foldable) {
    return (
      <div className="flex justify-between items-center">
        <div className="p-5 rounded-md flex flex-col gap-5 bg-primary/5  flex-grow">
          <div
            className="cursor-pointer"
            onClick={() => setFolded((folded) => !folded)}
          >
            <div className="flex flex-row gap-2 items-center">
              {isStreaming ? (
                <div className="flex-grow flex flex-row gap-3 items-center">
                  Working ... <Spinner />
                </div>
              ) : (
                <div className="flex-grow">
                  {folded ? 'Check' : 'Hide'} the code
                </div>
              )}
              {folded && <ArrowDownIcon className="h-5 w-5" />}
              {!folded && <ArrowUpIcon className="h-5 w-5" />}
            </div>
          </div>
          {!folded && messageComponents}
        </div>
        {!isStreaming && <MessageControls onRemoveClick={handleRemoveClick} />}
      </div>
    );
  } else {
    return messageComponents;
  }
}
