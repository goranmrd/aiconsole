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

import { AICMessage, AICMessageGroup } from '@/types/types';
import { MessageControls } from './MessageControls';
import { useAICStore } from '@/store/AICStore';
import { BlinkingCursor } from '@/components/chat/BlinkingCursor';
import { BASE_URL } from '@/api/Api';
import { CodeInput } from '../../materials/CodeInput';

interface MessageProps {
  group: AICMessageGroup,
  message: AICMessage;
  isStreaming: boolean;
}

export function TextMessage({ group, message, isStreaming }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(message.content);
  const removeMessageFromGroup = useAICStore((state) => state.removeMessageFromGroup);
  const editMessageContent = useAICStore((state) => state.editMessageContent);
  
  const handleEditClick = () => {
    if (isStreaming) {
      return;
    }
    setContent(message.content);
    setIsEditing(true);
  };

  const handleRemoveClick = () => removeMessageFromGroup(group.id, message.id);

  const handleCancelEditClick = () => setIsEditing(false);

  const handleOnChange = (value: string) => setContent(value);

  const handleSaveClick = useCallback(() => {
    editMessageContent(group.id, message.id, content);
    setIsEditing(false);
  }, [content, message.id, group.id, editMessageContent]);

  const handleBlur = useCallback(() => {
    // setTimeout with 0ms to delay the handleSaveClick call, this will ensure the
    // onClick event has priority over the onBlur event.
    setTimeout(handleSaveClick, 0);
  }, [handleSaveClick]);

  return (
    <div className="flex flex-grow items-start">
      {isEditing ? (
        <div className="bg-[#00000080] rounded-md w-[660px]">
          <CodeInput
            className="resize-none border-0 bg-transparent w-full outline-none h-96"
            value={content}
            onChange={handleOnChange}
            codeLanguage={'language' in message ? message.language : 'text'}
            transparent
            onBlur={handleBlur} // added onBlur event here
          />
        </div>
      ) : (
        <>
          {group.role !== 'user' && (
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

          {group.role === 'user' && (
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
