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

import { Spinner } from '@/components/chat/Spinner';
import { MessageControls } from './MessageControls';
import { useAICStore } from '@/store/AICStore';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { AICCodeMessage, AICMessageGroup } from '@/types/types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Button } from '../../system/Button';
import { duotoneDark as vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MessageProps {
  group: AICMessageGroup;
  message: AICCodeMessage;
  isStreaming: boolean;
}

export function CodeMessage({ group, message, isStreaming }: MessageProps) {
  const removeMessageFromGroup = useAICStore((state) => state.removeMessageFromGroup);
  const alwaysExecuteCode = useAICStore((state) => state.alwaysExecuteCode);

  const [folded, setFolded] = useState(alwaysExecuteCode);
  const doRun = useAICStore((state) => state.doRun);
  const enableAutoCodeExecution = useAICStore(
    (state) => state.enableAutoCodeExecution,
  );
  const isViableForRunningCode = useAICStore((state) => state.isViableForRunningCode);

  
  const handleAlwaysRunClick = () => {
    enableAutoCodeExecution();
    doRun();
  };


  const messageComponents = [
    <div key={message.id}>
      <span className="w-20 flex-none">Code:</span>
      <div>
        <SyntaxHighlighter
          style={vs2015}
          children={message.content}
          language={message.language}
          className="overflow-scroll max-w-2xl"
        />
        {
          isViableForRunningCode(group.id, message.id) &&
          !isStreaming && (
            <div className="flex gap-4 pt-4">
              <Button label="Run" onClick={doRun} />
              
              {!alwaysExecuteCode && <Button
                label="Always Run"
                onClick={handleAlwaysRunClick}
                variant="secondary"
              />}
            </div>
          )}
      </div>
    </div>
    
    ,
    ...message.outputs.map((output) => 
      <div key={output.id}>
        <span className="w-20 flex-none">Output:</span>
        <SyntaxHighlighter
          style={vs2015}
          children={output.content}
          language={'text'}
          className="basis-0 flex-grow overflow-scroll max-w-2xl"
        />
      </div>
    )
  ];

  const handleRemoveClick = () => {
    removeMessageFromGroup(group.id, message.id)
  };

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
}
