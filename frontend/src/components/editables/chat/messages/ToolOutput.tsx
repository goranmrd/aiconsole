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

import { useChatStore } from '@/store/editables/chat/useChatStore';
import { AICToolCall as AICToolCall } from '@/types/editables/chatTypes';
import { useCallback } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { duotoneDark as vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { EditableContentMessage } from './EditableContentMessage';

interface OutputProps {
  tool_call: AICToolCall;
}

export function ToolOutput({ tool_call }: OutputProps) {
  const editToolCall = useChatStore((state) => state.editToolCall);

  const handleAcceptedContent = useCallback(
    (content: string) => {
      editToolCall((toolCall) => {
        toolCall.output = content;
      }, tool_call.id);
    },
    [tool_call.id, editToolCall],
  );

  const handleRemoveClick = useCallback(() => {
    editToolCall((toolCall) => {
      toolCall.output = undefined;
    }, tool_call.id);
  }, [tool_call.id, editToolCall]);

  return (
    <div className="flex flex-row w-full">
      <span className="w-20 flex-none">Output: </span>
      <EditableContentMessage
        initialContent={tool_call.output || ''}
        isStreaming={tool_call.is_code_executing}
        handleAcceptedContent={handleAcceptedContent}
        handleRemoveClick={handleRemoveClick}
        className="flex-grow"
      >
        <SyntaxHighlighter
          style={vs2015}
          children={tool_call.output || ''}
          language={'text'}
          className="basis-0 flex-grow rounded-md p-2 overflow-auto"
        />
      </EditableContentMessage>
    </div>
  );
}
