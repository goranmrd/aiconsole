import { PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useRef } from 'react';

import { cn } from '../utils/styles';
import { useAICStore } from '../store/AICStore';

interface MessageInputProps {
  className?: string;
  onSubmit?: () => void;
}

export const CommandInput = ({ className, onSubmit }: MessageInputProps) => {
  const command = useAICStore((state) => state.commandHistory[state.commandIndex]);

  const {
    editCommand: setCommand,
    newCommand,
    isExecuteRunning,
    isAnalysisRunning,
    submitCommand,
    historyUp: promptUp,
    historyDown: promptDown,
    cancelGenerating,
    messages,
  } = useAICStore((state) => state);

  const sendingMessagesBlocked =
    isExecuteRunning ||
    isAnalysisRunning ||
    (command === '' && messages?.length == 0);
  const canBeStopped = isExecuteRunning;

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  if (textAreaRef.current) {
    if (command.trim() === '') {
      textAreaRef.current.style.height = `${16 + 24 + 2}px`;
    } else {
      textAreaRef.current.style.height = `${
        textAreaRef.current.scrollHeight + 2
      }px`;
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommand(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canBeStopped) {
        await handleCancelGenerating();
      } else if (!sendingMessagesBlocked) {
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

    submitCommand(trimmed);
    newCommand();

    if (onSubmit) onSubmit();
  };

  const handleCancelGenerating = async () => {
    cancelGenerating();
  };

  return (
    <div className={cn(className, 'flex w-full flex-col p-4  bg-stone-800/20 border-t border-gray-900')}>
      <div className="flex items-center">
        <textarea
          ref={textAreaRef}
          className="border-slate-300 bg-slate-400 text-slate-900 flex-grow resize-none overflow-hidden rounded-md border px-4 py-2 focus:outline-none focus:ring-2"
          value={command}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a new command here..."
          rows={1}
          style={{ boxSizing: 'border-box', transition: 'height 0.2s' }}
        />
        {canBeStopped && (
          <button
            className={cn(
              'focus:ring-primary ml-4 rounded-md px-4 py-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 bg-slate-400  text-red-900',
            )}
            type="button"
            onClick={handleCancelGenerating}
          >
            <StopIcon className="h-6 w-6 scale-75" />
          </button>
        )}
        <button
          className={cn(
            'focus:ring-primary ml-4 rounded-md px-4 py-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4',
            {
              'bg-slate-500  text-slate-800 cursor-not-allowed':
                sendingMessagesBlocked,
              'bg-indigo-700 hover:bg-indigo-500': !sendingMessagesBlocked,
            },
          )}
          type="button"
          onClick={handleSendMessage}
          disabled={sendingMessagesBlocked}
        >
          <PaperAirplaneIcon className="h-6 w-6 scale-75" />
        </button>
      </div>
    </div>
  );
};
