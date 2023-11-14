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

import { useEffect } from 'react';
import ScrollToBottom, { useScrollToBottom } from 'react-scroll-to-bottom';

import { EmptyChat } from '@/components/editables/chat/EmptyChat';
import { MessageGroup } from '@/components/editables/chat/MessageGroup';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { Button } from '../../common/Button';
import { Analysis } from './Analysis';
import { useProjectStore } from '@/store/projects/useProjectStore';

export function ChatWindowScrollToBottomSave() {
  const scrollToBottom = useScrollToBottom();
  const setScrollChatToBottom = useChatStore((state) => state.setScrollChatToBottom);

  useEffect(() => {
    setScrollChatToBottom(scrollToBottom)
  }, [scrollToBottom, setScrollChatToBottom])

  return <></>
}

export function Chat() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const chat = useChatStore((state) => state.chat);
  const loadingMessages = useChatStore((state) => state.loadingMessages);
  const isAnalysisRunning = useChatStore((state) => !!state.currentAnalysisRequestId);
  const isExecuteRunning = useChatStore((state) => state.isExecuteRunning);
  const stopWork = useChatStore((state) => state.stopWork);
  const submitCommand = useChatStore((state) => state.submitCommand);
  const isProjectOpen = useProjectStore((state) => state.isProjectOpen);
  const isProjectLoading = useProjectStore((state) => state.isProjectLoading);

  if (!chat) {
    return null;
  }

  const isLastMessageFromUser = chat.message_groups.length > 0 && chat.message_groups[chat.message_groups.length - 1].agent_id === 'user';
  
  

  useEffect(() => {

    //if there is exactly one text area focus on it
    const textAreas = document.getElementsByTagName('textarea');
    if (textAreas.length === 1) {
      textAreas[0].focus();
    }

    return () => {
      stopWork();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id, isProjectOpen]); //Initentional trigger when chat_id changes

  return !isProjectLoading && !loadingMessages ? ( // This is needed because of https://github.com/compulim/react-scroll-to-bottom/issues/61#issuecomment-1608456508
    <ScrollToBottom className="h-full overflow-y-auto flex flex-col" scrollViewClassName="main-chat-window" initialScrollBehavior="auto" mode={'bottom'}>
      <ChatWindowScrollToBottomSave />
      {chat.message_groups.length === 0 && <EmptyChat />}

      {chat.message_groups.map((group, index) => (
        <MessageGroup
          group={group}
          key={group.id}
          isStreaming={isExecuteRunning && index === chat.message_groups.length - 1}
        />
      ))}
      <Analysis />

      <div className="flex items-center justify-center m-5">
        {!isExecuteRunning && !isAnalysisRunning && !isLastMessageFromUser && <Button
          variant="secondary"

          onClick={() =>
            submitCommand(
              `I'm stuck at using AIConsole, can you suggest what can I do from this point in the conversation?`,
            )
          }
        >
          Guide me
        </Button>}
      </div>
    </ScrollToBottom>
  ) : (
    <div className="h-full overflow-y-auto flex flex-col"></div>
  );
}
