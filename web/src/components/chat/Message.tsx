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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark as vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { AICMessage } from '@/types/types';
import { MessageControls } from './MessageControls';
import { useAICStore } from '@/store/AICStore';
import { BlinkingCursor } from '@/components/chat/BlinkingCursor';
import { BASE_URL } from '@/api/Api';
import { Button } from '@/components/system/Button';
import { CodeInput } from '../materials/CodeInput';

interface MessageProps {
  message: AICMessage;
  isStreaming: boolean;
}

export function Message({ message, isStreaming }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(message.content);
  const removeMessage = useAICStore((state) => state.removeMessage);
  const updateMessage = useAICStore((state) => state.editMessageContent);
  const executeCode = useAICStore((state) => state.alwaysExecuteCode);
  const doRun = useAICStore((state) => state.doRun);
  const enableAutoCodeExecution = useAICStore(
    (state) => state.enableAutoCodeExecution,
  );
  const markMessageAsRan = useAICStore((state) => state.markMessageAsRan);

  const handleEditClick = () => {
    if (isStreaming) {
      return;
    }
    setContent(message.content);
    setIsEditing(true);
  };

  const handleRemoveClick = () => removeMessage(message.id);

  const handleCancelEditClick = () => setIsEditing(false);

  const handleOnChange = (value: string) => setContent(value);

  const handleSaveClick = useCallback(() => {
    updateMessage(message.id, content);
    setIsEditing(false);
  }, [content, message.id, updateMessage]);

  const handleBlur = useCallback(() => {
    // setTimeout with 0ms to delay the handleSaveClick call, this will ensure the
    // onClick event has priority over the onBlur event.
    setTimeout(handleSaveClick, 0);
  }, [handleSaveClick]);

  const runCode = () => {
    if (!message.task || !message.language) {
      return;
    }

    doRun(
      message.agent_id,
      message.task,
      message.materials_ids,
      message.language,
      message.content,
    );
  };

  const handleAlwaysRunClick = () => {
    enableAutoCodeExecution();
    runCode();
  };

  const handleNoClick = () => {
    markMessageAsRan(message.id);
  };

  return (
    <div className="flex flex-grow items-start">
      {isEditing ? (
        <div className="bg-[#00000080] rounded-md w-[660px]">
          <CodeInput
            className="resize-none border-0 bg-transparent w-full outline-none h-96"
            value={content}
            onChange={handleOnChange}
            codeLanguage={message.language}
            transparent
            onBlur={handleBlur} // added onBlur event here
          />
        </div>
      ) : (
        <>
          {message.code && (
            <>
              <span className="w-20 flex-none">Code:</span>
              <div>
                <SyntaxHighlighter
                  style={vs2015}
                  children={message.content}
                  language={message.language}
                  className="overflow-scroll max-w-2xl"
                />
                {!message.code_output &&
                  !message.code_ran &&
                  !executeCode &&
                  !isStreaming && (
                    <div className="flex gap-4 pt-4">
                      <Button label="Run" onClick={runCode} />
                      <Button
                        label="Don't Run"
                        variant="danger"
                        onClick={handleNoClick}
                      />
                      <Button
                        label="Always Run"
                        onClick={handleAlwaysRunClick}
                        variant="secondary"
                      />
                    </div>
                  )}
              </div>
            </>
          )}

          {message.code_output && (
            <>
              <span className="w-20 flex-none">Output:</span>
              <SyntaxHighlighter
                style={vs2015}
                children={message.content}
                language={'text'}
                className="basis-0 flex-grow overflow-scroll max-w-2xl"
              />
            </>
          )}

          {!message.code && !message.code_output && message.role !== 'user' && (
            <div className="flex-grow">
              <div className="prose prose-stone dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ src, ...props }) => {
                      return (
                        <a
                          href={`${BASE_URL}/image?path=${src}`}
                          target="_blank"
                        >
                          <img
                            src={`${BASE_URL}/image?path=${src}`}
                            {...props}
                            className=" max-w-xs rounded-md mr-5"
                            alt={props.alt}
                          />
                        </a>
                      );
                    },
                    code(props) {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { children, className, inline, node, ...rest } =
                        props;
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...rest}
                          style={vs2015}
                          children={String(children).replace(/\n$/, '')}
                          language={match[1]}
                          PreTag="div"
                        />
                      ) : (
                        <code {...rest} className={className}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {isStreaming && !message.content && <BlinkingCursor />}
              </div>
            </div>
          )}

          {!message.code && !message.code_output && message.role === 'user' && (
            <div className="flex-grow">
              {message.content.split('\n').map((line, index) => (
                <span key={`line-${index}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {line}
                  {index !== message.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {!isStreaming && (
        <MessageControls
          isEditing={isEditing}
          onCancelClick={handleCancelEditClick}
          onEditClick={handleEditClick}
          onSaveClick={handleSaveClick}
          onRemoveClick={handleRemoveClick}
        />
      )}
    </div>
  );
}
