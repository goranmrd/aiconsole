import { ChangeEvent, useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import { AICMessage } from '../store/types';
import { MessageControls } from './MessageControls';
import { useAICStore } from '../store/AICStore';
import { BlinkingCursor } from './BlinkingCursor';
import { BASE_URL } from '../api/Api';

interface MessageProps {
  message: AICMessage;
  isStreaming: boolean;
}

export function Message({ message, isStreaming }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(message.content);
  const removeMessage = useAICStore((state) => state.removeMessage);
  const updateMessage = useAICStore((state) => state.editMessageContent);

  const handleEditClick = () => {
    if (isStreaming) {
      return;
    }
    setContent(message.content);
    setIsEditing(true);
  };

  const handleRemoveClick = () => removeMessage(message.id);

  const handleCancelEditClick = () => setIsEditing(false);

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setContent(e.target.value);

  const handleSaveClick = useCallback(() => {
    updateMessage(message.id, content);
    setIsEditing(false);
  }, [content, message.id, updateMessage]);

  const handleBlur = useCallback(() => {
    // setTimeout with 0ms to delay the handleSaveClick call, this will ensure the
    // onClick event has priority over the onBlur event.
    setTimeout(handleSaveClick, 0);
  }, [handleSaveClick]);

  return (
    <div className="flex flex-grow items-start">
      {isEditing ? (
        <div className="bg-[#00000080] rounded-md w-[660px]">
          <TextareaAutosize
            className="resize-none border-0 bg-transparent w-full outline-none h-96 p-4"
            defaultValue={content}
            onChange={handleOnChange}
            onBlur={handleBlur} // added onBlur event here
          />
        </div>
      ) : (
        <>
          {message.code && (
            <>
              <span className="w-20 flex-none">Code:</span>
              <SyntaxHighlighter
                style={darcula}
                children={message.content}
                language={message.language}
                className="overflow-scroll max-w-2xl"
              />
            </>
          )}

          {message.code_output && (
            <>
              <span className="w-20 flex-none">Output:</span>
              <SyntaxHighlighter
                style={darcula}
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
                            className=" max-w-xs rounded-md float-left mr-5 "
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
                          style={darcula}
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
