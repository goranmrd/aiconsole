import { AICMessage, AICMessageGroup } from '../../../../types/editables/chatTypes';
import { ToolCall } from './ToolCall';

import { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark as vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { BlinkingCursor } from '@/components/editables/chat/BlinkingCursor';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useAPIStore } from '@/store/useAPIStore';
import { EditableContentMessage } from './EditableContentMessage';

interface MessageProps {
  group: AICMessageGroup;
  message: AICMessage;
}

export function MessageComponent({ message, group }: MessageProps) {
  const removeMessageFromGroup = useChatStore((state) => state.removeMessageFromGroup);
  const editMessage = useChatStore((state) => state.editMessage);
  const saveCommandAndMessagesToHistory = useChatStore((state) => state.saveCommandAndMessagesToHistory);
  const getBaseURL = useAPIStore((state) => state.getBaseURL);

  const handleRemoveClick = useCallback(() => {
    removeMessageFromGroup(message.id);
  }, [message.id, removeMessageFromGroup]);

  const handleSaveClick = useCallback(
    (content: string) => {
      editMessage((message: AICMessage) => {
        message.content = content;
      }, message.id);

      saveCommandAndMessagesToHistory(content, group.role === 'user');
    },
    [message.id, editMessage, saveCommandAndMessagesToHistory, group.role],
  );

  const submitCommand = useChatStore((state) => state.submitCommand);

  return (
    <div key={message.id}>
      <EditableContentMessage
        initialContent={message.content}
        isStreaming={message.is_streaming}
        handleAcceptedContent={handleSaveClick}
        handleRemoveClick={handleRemoveClick}
      >
        <div className="flex flex-col gap-2">
          {message.content && (
            <>
              {group.role !== 'user' && (
                <div className="flex-grow">
                  <div className="prose prose-stone dark:prose-invert ">
                    <ReactMarkdown
                      components={{
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        a: ({ node, href, ...props }) => {
                          if (href === 'command') {
                            const command = props.children[0]?.toString();
                            return (
                              <a
                                {...props}
                                className="text-secondary hover:text-secondary-light cursor-pointer"
                                onClick={() => {
                                  if (command) submitCommand(command);
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
                            <a href={`${getBaseURL()}/image?path=${src}`} target="_blank">
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
                          const { children, className, inline, node, ...rest } = props;
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
                    {message.is_streaming && !message.content && !message.tool_calls && <BlinkingCursor />}
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

          {message.tool_calls.map((tool_call) => (
            <ToolCall key={tool_call.id} group={group} tool_call={tool_call} />
          ))}
        </div>
      </EditableContentMessage>
    </div>
  );
}
