// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
    
import { useState } from 'react';

import { AICMessageSection } from '@/types/types';
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
  const alwaysExecuteCode = useAICStore((state) => state.alwaysExecuteCode);

  const [folded, setFolded] = useState(alwaysExecuteCode);

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
        <div className="p-5 rounded-md flex flex-col gap-5 bg-primary/5 flex-grow max-w-[90%]">
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
