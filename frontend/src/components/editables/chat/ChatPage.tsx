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

import { EditablesAPI } from '@/api/api/EditablesAPI';
import { EmptyChat } from '@/components/editables/chat/EmptyChat';
import { MessageGroup } from '@/components/editables/chat/MessageGroup';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useProjectStore } from '@/store/projects/useProjectStore';
import { Chat } from '@/types/editables/chatTypes';
import showNotification from '@/utils/common/showNotification';
import { useEditableObjectContextMenu } from '@/utils/editables/useContextMenuForEditable';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ScrollToBottom, { useScrollToBottom } from 'react-scroll-to-bottom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../../common/Button';
import { EditorHeader } from '../EditorHeader';
import { CommandInput } from './CommandInput';
import { Tooltip } from '@/components/common/Tooltip';
import { BlinkingCursor } from './BlinkingCursor';
import { useChat } from '@/utils/editables/useChat';

export function ChatWindowScrollToBottomSave() {
  const scrollToBottom = useScrollToBottom();
  const setScrollChatToBottom = useChatStore((state) => state.setScrollChatToBottom);

  useEffect(() => {
    setScrollChatToBottom(scrollToBottom);
  }, [scrollToBottom, setScrollChatToBottom]);

  return <></>;
}

export function ChatPage() {
  // Monitors params and initialises useChatStore.chat and useAssetStore.selectedAsset zustand stores
  const params = useParams();
  const id = params.id || '';
  const editableObjectType = 'chat';
  const searchParams = useSearchParams()[0];
  const copyId = searchParams.get('copy');
  const forceRefresh = searchParams.get('forceRefresh'); // used to force a refresh

  const chat = useChatStore((state) => state.chat);
  const loadingMessages = useChatStore((state) => state.loadingMessages);
  const isAnalysisRunning = useChatStore((state) => state.isAnalysisRunning());
  const isExecutionRunning = useChatStore((state) => state.isExecutionRunning());
  const stopWork = useChatStore((state) => state.stopWork);
  const submitCommand = useChatStore((state) => state.submitCommand);
  const isProjectOpen = useProjectStore((state) => state.isProjectOpen);
  const isProjectLoading = useProjectStore((state) => state.isProjectLoading);
  const { showContextMenu } = useEditableObjectContextMenu({ editable: chat, editableObjectType: 'chat' });
  const { setChat, renameChat } = useChat();

  const thinkingProcess = useChatStore((store) => store.analysis.thinking_process);
  const nextStep = useChatStore((store) => store.analysis.next_step);

  // Acquire the initial object
  useEffect(() => {
    if (copyId) {
      EditablesAPI.fetchEditableObject<Chat>({ editableObjectType: 'chat', id }).then((chat) => {
        chat.id = uuidv4();
        chat.name = chat.name + ' (copy)';
        setChat(chat);
      });
    } else {
      //For id === 'new' This will get a default new asset
      EditablesAPI.fetchEditableObject<Chat>({ editableObjectType, id }).then((newChat) => {
        setChat(newChat);
      });
    }

    return () => {
      useChatStore.setState({ chat: undefined });
    };
  }, [copyId, id, editableObjectType, forceRefresh, setChat]);

  const isLastMessageFromUser =
    chat?.message_groups.length && chat.message_groups[chat.message_groups.length - 1].agent_id === 'user';

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
  }, [chat?.id, isProjectOpen]); //Initentional trigger when chat_id changes

  if (!chat) {
    return null;
  }

  const handleRename = async (newName: string) => {
    if (newName !== chat.name) {
      const newChat = { ...chat, name: newName, title_edited: true } as Chat;

      await renameChat(newChat);

      showNotification({
        title: 'Renamed',
        message: 'renamed',
        variant: 'success',
      });
    }
  };

  let greatButton;

  if (!isExecutionRunning && !isAnalysisRunning && !isLastMessageFromUser) {
    greatButton = (
      <Button
        variant="secondary"
        onClick={() =>
          submitCommand(
            `I'm stuck at using AIConsole, can you suggest what can I do from this point in the conversation?`,
          )
        }
      >
        Guide me
      </Button>
    );
  } else if (!isExecutionRunning && !isAnalysisRunning && isLastMessageFromUser) {
    greatButton = (
      <Button variant="secondary" onClick={() => submitCommand(``)}>
        Answer
      </Button>
    );
  } else if (isExecutionRunning) {
    greatButton = (
      <div>
        <Button
          variant="secondary"
          classNames="animate-pulse relative group"
          onClick={() => {
            stopWork();
          }}
        >
          <span className="inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
            Working ...
          </span>
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            Stop
          </span>
        </Button>
      </div>
    );
  } else {
    greatButton = (
      <Tooltip
        w={400}
        opened={true}
        offset={10}
        withArrow
        zIndex={5}
        label={
          <>
            {` ${thinkingProcess || ''}`}{' '}
            {nextStep && (
              <>
                <br /> Next step: <span className="text-secondary/50 leading-[24px]">{nextStep}</span>
              </>
            )}{' '}
            <BlinkingCursor />
          </>
        }
        multiline={true}
      >
        <div>
          <Button
            variant="secondary"
            classNames="animate-pulse relative group"
            onClick={() => {
              stopWork();
            }}
          >
            <span className="inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
              Analysing ...
            </span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              Stop
            </span>
          </Button>
        </div>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col w-full h-full max-h-full overflow-auto">
      <EditorHeader editable={chat} onRename={handleRename} isChanged={false} onContextMenu={showContextMenu} />
      <div className="flex-grow overflow-auto">
        <div className="flex w-full h-full flex-col justify-between downlight">
          {!isProjectLoading && !loadingMessages ? ( // This is needed because of https://github.com/compulim/react-scroll-to-bottom/issues/61#issuecomment-1608456508
            <ScrollToBottom
              className="h-full overflow-y-auto flex flex-col"
              scrollViewClassName="main-chat-window"
              initialScrollBehavior="auto"
              mode={'bottom'}
            >
              <ChatWindowScrollToBottomSave />
              {chat.message_groups.length === 0 && <EmptyChat />}

              {chat.message_groups.map((group) => (
                <MessageGroup group={group} key={group.id} />
              ))}

              <div className="flex items-center justify-center m-5">{greatButton}</div>
            </ScrollToBottom>
          ) : (
            <div className="h-full overflow-y-auto flex flex-col"></div>
          )}
          <CommandInput className="flex-none" />
        </div>
      </div>
    </div>
  );
}
