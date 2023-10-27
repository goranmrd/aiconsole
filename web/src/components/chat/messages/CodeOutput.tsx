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

import { useCallback } from 'react';
import { useAICStore } from '@/store/AICStore';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { duotoneDark as vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { AICCodeMessage, AICContentMessage, AICMessageGroup } from '@/types/types';
import { EditableContentMessage } from './EditableContentMessage';

interface OutputProps {
  group: AICMessageGroup;
  message: AICCodeMessage;
  output: AICContentMessage;
  isStreaming: boolean;
}

export function CodeOutput({ group, message, output, isStreaming }: OutputProps) {
  const removeOutputFromCode = useAICStore((state) => state.removeOutputFromCode);
  const editOutputContent = useAICStore((state) => state.editOutputContent);

  const handleAcceptedContent = useCallback(
    (content: string) => {
      editOutputContent(group.id, message.id, output.id, content);
    },
    [message.id, group.id, output.id, editOutputContent],
  );

  const handleRemoveClick = useCallback(() => {
    removeOutputFromCode(group.id, message.id, output.id);
  }, [group.id, message.id, output.id, removeOutputFromCode]);

  return (
    <div className="flex flex-row w-full">
      <span className="w-20">Output: </span>
      <EditableContentMessage
        initialContent={output.content}
        isStreaming={isStreaming}
        handleAcceptedContent={handleAcceptedContent}
        handleRemoveClick={handleRemoveClick}
        className="flex-grow"
      >
        <SyntaxHighlighter
          style={vs2015}
          children={output.content}
          language={'text'}
          className="basis-0 overflow-scroll max-w-3xl flex-grow rounded-md p-2"
        />
      </EditableContentMessage>
    </div>
  );
}
