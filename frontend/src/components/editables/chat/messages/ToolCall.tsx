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

import { useCallback, useState } from 'react';

import { Spinner } from '@/components/editables/chat/Spinner';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useSettingsStore } from '@/store/settings/useSettingsStore';
import { AICMessage, AICMessageGroup, AICToolCall } from '@/types/editables/chatTypes';
import { upperFirst } from '@mantine/hooks';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ChevronDown,
  ChevronUp,
  CircleDashedIcon,
  Infinity,
  Play,
} from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { duotoneDark as vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Button } from '../../../common/Button';
import { EditableContentMessage } from './EditableContentMessage';
import { ToolOutput } from './ToolOutput';

interface MessageProps {
  group: AICMessageGroup;
  toolCall: AICToolCall;
}

export function ToolCall({ group, toolCall: tool_call }: MessageProps) {
  const removeToolCallFromMessage = useChatStore((state) => state.removeToolCallFromMessage);
  const editMessage = useChatStore((state) => state.editMessage);
  const saveCommandAndMessagesToHistory = useChatStore((state) => state.saveCommandAndMessagesToHistory);

  const alwaysExecuteCode = useSettingsStore((state) => state.alwaysExecuteCode);

  const [folded, setFolded] = useState(alwaysExecuteCode);
  const doRun = useChatStore((state) => state.doRun);
  const enableAutoCodeExecution = useSettingsStore((state) => state.setAutoCodeExecution);
  const isViableForRunningCode = useChatStore((state) => state.isViableForRunningCode);

  const handleAlwaysRunClick = () => {
    enableAutoCodeExecution(true);
    doRun(tool_call.id);
  };

  const handleRunClick = () => {
    doRun(tool_call.id);
  };

  const handleAcceptedContent = useCallback(
    (content: string) => {
      editMessage((message: AICMessage) => {
        message.content = content;
      }, tool_call.id);

      saveCommandAndMessagesToHistory(content, group.role === 'user');
    },
    [tool_call.id, editMessage, saveCommandAndMessagesToHistory, group.role],
  );

  const handleRemoveClick = useCallback(() => {
    removeToolCallFromMessage(tool_call.id);
  }, [tool_call.id, removeToolCallFromMessage]);

  //Either executing or streaming while there are still no output messages
  const shouldDisplaySpinner =
    tool_call.is_code_executing || (tool_call.is_streaming && tool_call.output === undefined);

  const isError = tool_call.output?.includes('Traceback') || tool_call.output?.includes('Error');

  return (
    <div className="p-5 rounded-md flex flex-col gap-5 bg-primary/5 flex-grow mr-4 overflow-auto">
      <div className="cursor-pointer" onClick={() => setFolded((folded) => !folded)}>
        <div className="flex flex-row gap-2 items-center">
          <div className="flex-grow flex flex-row gap-3 items-center">
            {shouldDisplaySpinner && <Spinner />}
            {!shouldDisplaySpinner && !isError && tool_call.output === undefined && (
              <CircleDashedIcon className="h-5 w-5 text-green-500" />
            )}
            {!shouldDisplaySpinner && !isError && tool_call.output !== undefined && (
              <CheckCircle2Icon className="h-5 w-5 text-green-500" />
            )}
            {!shouldDisplaySpinner && isError && <AlertCircleIcon className="h-5 w-5 text-red-500" />}
            {tool_call.headline ? `${tool_call.headline}` : `${upperFirst(tool_call.language)} task`}
          </div>

          {folded && <ChevronUp className="h-5 w-5" />}
          {!folded && <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {!folded && (
        <>
          <div className="flex flex-row w-full">
            <span className="w-20 flex-none">{upperFirst(tool_call.language)}: </span>
            <div className="flex-grow overflow-auto">
              <EditableContentMessage
                initialContent={tool_call.code}
                isStreaming={tool_call.is_streaming}
                language={tool_call.language}
                handleAcceptedContent={handleAcceptedContent}
                handleRemoveClick={handleRemoveClick}
              >
                <SyntaxHighlighter
                  style={vs2015}
                  children={tool_call.code}
                  language={tool_call.language}
                  className="overflow-scroll flex-grow rounded-md"
                />
              </EditableContentMessage>
              {isViableForRunningCode(tool_call.id) && !tool_call.is_streaming && (
                <div className="flex gap-4 pt-2">
                  <Button variant="status" statusColor="green" small onClick={handleRunClick}>
                    <Play />
                    Run
                  </Button>

                  {!alwaysExecuteCode && (
                    <Button onClick={handleAlwaysRunClick} variant="status" statusColor="purple" small>
                      <Infinity />
                      Always Run
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>{tool_call.output !== undefined && <ToolOutput tool_call={tool_call} />}</div>
        </>
      )}
    </div>
  );
}
