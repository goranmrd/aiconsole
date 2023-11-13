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
import { ChevronDown, ChevronUp, Play, Infinity } from 'lucide-react';
import { AICCodeMessage, AICMessageGroup } from "@/types/editables/chatTypes";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Button } from '../../../common/Button';
import { duotoneDark as vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CodeOutput } from './CodeOutput';
import { EditableContentMessage } from './EditableContentMessage';
import { useSettingsStore } from '@/store/settings/useSettingsStore';

interface MessageProps {
  group: AICMessageGroup;
  message: AICCodeMessage;
  isStreaming: boolean;
}

export function CodeMessage({ group, message, isStreaming }: MessageProps) {
  const removeMessageFromGroup = useChatStore(
    (state) => state.removeMessageFromGroup,
  );
  const editMessageContent = useChatStore((state) => state.editMessageContent);

  const alwaysExecuteCode = useSettingsStore((state) => state.alwaysExecuteCode);

  const [folded, setFolded] = useState(alwaysExecuteCode);
  const doRun = useChatStore((state) => state.doRun);
  const enableAutoCodeExecution = useSettingsStore(
    (state) => state.setAutoCodeExecution,
  );
  const isViableForRunningCode = useChatStore(
    (state) => state.isViableForRunningCode,
  );

  const handleAlwaysRunClick = () => {
    enableAutoCodeExecution(true);
    doRun(group.id, message.id);
  };

  const handleRunClick = () => {
    doRun(group.id, message.id);
  };

  const handleAcceptedContent = useCallback(
    (content: string) => {
      editMessageContent(group.id, message.id, content);
    },
    [message.id, group.id, editMessageContent],
  );

  const handleRemoveClick = useCallback(() => {
    removeMessageFromGroup(group.id, message.id);
  }, [message.id, group.id, removeMessageFromGroup]);

  //Either executing or streaming while there are still no output messages
  const shouldDisplaySpinner =
    message.is_code_executing || (isStreaming && message.outputs.length === 0);

  return (
    <div className="flex justify-between items-center">
      <div className="p-5 rounded-md flex flex-col gap-5 bg-primary/5 flex-grow mr-4 overflow-auto">
        <div
          className="cursor-pointer"
          onClick={() => setFolded((folded) => !folded)}
        >
          <div className="flex flex-row gap-2 items-center">
            {shouldDisplaySpinner ? (
              <div className="flex-grow flex flex-row gap-3 items-center">
                Working ... <Spinner />
              </div>
            ) : (
              <div className="flex-grow">
                {folded ? 'Check' : 'Hide'} the code
              </div>
            )}

            {folded && <ChevronUp className="h-5 w-5" />}
            {!folded && <ChevronDown className="h-5 w-5" />}
          </div>
        </div>

        {!folded && (
          <>
            <div className="flex flex-row w-full">
              <span className="w-20 flex-none">Code: </span>
              <div className="flex-grow overflow-auto">
                <EditableContentMessage
                  initialContent={message.content}
                  isStreaming={isStreaming}
                  language={message.language}
                  handleAcceptedContent={handleAcceptedContent}
                  handleRemoveClick={handleRemoveClick}
                >
                  <SyntaxHighlighter
                    style={vs2015}
                    children={message.content}
                    language={message.language}
                    className="overflow-scroll flex-grow rounded-md"
                  />
                </EditableContentMessage>
                {isViableForRunningCode(group.id, message.id) &&
                  !isStreaming && (
                    <div className="flex gap-4 pt-2">
                      <Button
                        variant="status"
                        statusColor="green"
                        small
                        onClick={handleRunClick}
                      >
                        <Play />
                        Run
                      </Button>

                      {!alwaysExecuteCode && (
                        <Button
                          onClick={handleAlwaysRunClick}
                          variant="status"
                          statusColor="purple"
                          small
                        >
                          <Infinity />
                          Always Run
                        </Button>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {...message.outputs.map((output) => (
              <div key={output.id}>
                <CodeOutput
                  group={group}
                  message={message}
                  output={output}
                  isStreaming={isStreaming}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
