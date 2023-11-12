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
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark as vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { AICMessage, AICMessageGroup } from "../../chatTypes";
import { useAICStore } from '@/project/editables/chat/AICStore';
import { BlinkingCursor } from '@/project/editables/chat/components/BlinkingCursor';
import { EditableContentMessage } from './EditableContentMessage';
import { useAPIStore } from '@/common/useAPIStore';

interface MessageProps {
  group: AICMessageGroup;
  message: AICMessage;
  isStreaming: boolean;
}

export function TextMessage({ group, message, isStreaming }: MessageProps) {
  const removeMessageFromGroup = useAICStore(
    (state) => state.removeMessageFromGroup,
  );
  const editMessageContent = useAICStore((state) => state.editMessageContent);
  const getBaseURL = useAPIStore((state) => state.getBaseURL);

  const handleRemoveClick = useCallback(() => {
    removeMessageFromGroup(group.id, message.id);
  }, [message.id, group.id, removeMessageFromGroup]);

  const handleSaveClick = useCallback(
    (content: string) => {
      editMessageContent(group.id, message.id, content);
    },
    [message.id, group.id, editMessageContent],
  );

  const submitCommand = useAICStore((state) => state.submitCommand);

  return (
    <EditableContentMessage
      initialContent={message.content}
      isStreaming={isStreaming}
      handleAcceptedContent={handleSaveClick}
      handleRemoveClick={handleRemoveClick}
    >
      <>
        {group.role !== 'user' && (
          <div className="flex-grow">
            <div className="prose prose-stone dark:prose-invert ">
              <ReactMarkdown
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  a: ({ node, href, ...props }) => {
                    if (href === 'command') {
                      const command = props.children[0]?.toString()
                      return (
                        <a
                          {...props}
                          className="text-secondary hover:text-secondary-light cursor-pointer"
                          onClick={() => {
                            if (command)
                              submitCommand(command);
                          }}
                        >
                          {props.children}
                        </a>
                      );
                    }
                    return (
                      <a
                        href={href}
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {props.children}
                      </a>
                    );
                  },
                  img: ({ src, ...props }) => {
                    return (
                      <a
                        href={`${getBaseURL()}/image?path=${src}`}
                        target="_blank"
                      >
                        <img
                          src={`${getBaseURL()}/image?path=${src}`}
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
    </EditableContentMessage>
  );
}
