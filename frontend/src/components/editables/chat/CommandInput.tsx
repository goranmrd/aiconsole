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

import TextareaAutosize from 'react-textarea-autosize';
import { useEffect, useRef } from 'react';
import { SendHorizonal, Square } from 'lucide-react';
import { cn } from '@/utils/common/cn';
import { useChatStore } from '@/store/editables/chat/useChatStore';

interface MessageInputProps {
  className?: string;
  onSubmit?: () => void;
}

export const CommandInput = ({ className, onSubmit }: MessageInputProps) => {
  const command = useChatStore(
    (state) => state.commandHistory[state.commandIndex],
  );

  const setCommand = useChatStore((state) => state.editCommand);
  const newCommand = useChatStore((state) => state.newCommand);
  const submitCommand = useChatStore((state) => state.submitCommand);
  const promptUp = useChatStore((state) => state.historyUp);
  const promptDown = useChatStore((state) => state.historyDown);
  const stopWork = useChatStore((state) => state.stopWork);
  const isAnalysisRunning = useChatStore((state) => !!state.currentAnalysisRequestId);
  const isExecuteRunning = useChatStore((state) => state.isExecuteRunning);
  const isWorking = isAnalysisRunning || isExecuteRunning;
  const chat = useChatStore((state) => state.chat);

  if (!chat) {
    return null;
  }

  const sendingMessagesBlocked =
    (command === '' && chat.message_groups?.length == 0);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommand(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (!sendingMessagesBlocked) {
        await handleSendMessage();
      }
    }

    if (textAreaRef.current) {
      const caretAtStart =
        textAreaRef.current.selectionStart === 0 &&
        textAreaRef.current.selectionEnd === 0;
      const caretAtEnd =
        textAreaRef.current.selectionStart ===
          textAreaRef.current.value.length &&
        textAreaRef.current.selectionEnd === textAreaRef.current.value.length;

      if (e.key === 'ArrowUp' && caretAtStart) {
        promptUp();
      } else if (e.key === 'ArrowDown' && caretAtEnd) {
        promptDown();
      }
    }
  };

  const handleSendMessage = async () => {
    const trimmed = command.trim();

    await submitCommand(trimmed);
    await newCommand();

    if (onSubmit) onSubmit();
  };

  // auto focus this text area on changes to chatId
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [chat.id]);

  return (
    <div
      className={cn(
        className,
        'flex w-full flex-col p-4  bg-gray-800/90 border-t border-white/10 drop-shadow-2xl  z-50',
      )}
    >
      <div className="flex items-center">
        <TextareaAutosize
          ref={textAreaRef}
          className="border-white/20 ring-secondary/30 bg-black flex-grow resize-none overflow-hidden rounded-3xl border px-4 py-2 focus:outline-none focus:ring-2"
          value={command}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a new command here..."
          rows={1}
          style={{ boxSizing: 'border-box', transition: 'height 0.2s' }}
        />
        {isWorking && (
          <button
            className={cn(
              'focus:ring-secondary ml-4 rounded-full p-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 border border-secondary text-secondary',
            )}
            type="button"
            onClick={stopWork}
          >
            <Square className="h-6 w-6" />
          </button>
        )}
        <button
          className={cn(
            'focus:ring-secondary ml-4 rounded-full p-2 text-gray-800 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4',
            {
              'bg-slate-500  text-slate-800 cursor-not-allowed':
                sendingMessagesBlocked,
              'bg-secondary-dark hover:bg-secondary': !sendingMessagesBlocked,
            },
          )}
          type="button"
          onClick={handleSendMessage}
          disabled={sendingMessagesBlocked}
        >
          <SendHorizonal className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
