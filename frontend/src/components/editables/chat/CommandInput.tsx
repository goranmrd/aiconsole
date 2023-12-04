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

import { Button } from '@/components/common/Button';
import { Tooltip } from '@/components/common/Tooltip';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { cn } from '@/utils/common/cn';
import { LucideIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface MessageInputProps {
  actionIcon: LucideIcon | ((props: React.SVGProps<SVGSVGElement>) => JSX.Element);
  className?: string;
  actionLabel: string;
  onSubmit?: (command: string) => void;
}

export const CommandInput = ({ className, onSubmit, actionIcon, actionLabel }: MessageInputProps) => {
  const ActionIcon = actionIcon;
  const command = useChatStore((state) => state.commandHistory[state.commandIndex]);

  const setCommand = useChatStore((state) => state.editCommand);
  const promptUp = useChatStore((state) => state.historyUp);
  const promptDown = useChatStore((state) => state.historyDown);
  const chat = useChatStore((state) => state.chat);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommand(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      await handleSendMessage();
    }

    if (textAreaRef.current) {
      const caretAtStart = textAreaRef.current.selectionStart === 0 && textAreaRef.current.selectionEnd === 0;
      const caretAtEnd =
        textAreaRef.current.selectionStart === textAreaRef.current.value.length &&
        textAreaRef.current.selectionEnd === textAreaRef.current.value.length;

      if (e.key === 'ArrowUp' && caretAtStart) {
        promptUp();
      } else if (e.key === 'ArrowDown' && caretAtEnd) {
        promptDown();
      }
    }
  };

  const handleSendMessage = async (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onSubmit) onSubmit(command);

    if (e) e.currentTarget.blur();
  };

  // auto focus this text area on changes to chatId
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [chat?.id]);

  return (
    <div
      className={cn(
        className,
        'flex w-full flex-col p-4  bg-gray-800/90 border-t border-white/10 drop-shadow-2xl  z-50',
      )}
    >
      <div className="flex items-center gap-2">
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
        <Tooltip label={actionLabel} position="top-end" offset={10}>
          <div>
            <Button variant="primary" iconOnly={true} onClick={handleSendMessage} classNames={cn('p-2', {})}>
              <ActionIcon className="w-6 h-6" />
            </Button>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
