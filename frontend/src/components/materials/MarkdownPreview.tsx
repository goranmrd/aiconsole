import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { cn } from '@/utils/styles';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

interface MarkdownPreviewProps {
  text: string;
  disabled?: boolean;
}

const customDivStyle = {
  backgroundColor: 'transparent',
  padding: 0,
};

const MarkdownPreview = ({ text, disabled }: MarkdownPreviewProps) => {
  return (
    <div className="w-1/2 h-[calc(100vh-500px)] min-h-[300px]">
      <p className="font-bold mb-4">
        Preview of markdown text to be injected into AI context:
      </p>
      <div className="bg-black/20 p-3 w-full   overflow-y-auto h-[calc(100%-40px)]">
        <div
          className={cn('prose prose-default w-full', {
            'opacity-[0.7] ': disabled,
          })}
        >
          <ReactMarkdown
            components={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              code({ className, children, inline, node, ...props }) {
                const match = /language-(\w+)/.exec(className || '');

                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vs2015}
                    PreTag="div"
                    language={'markdown'}
                    children={String(children).replace(/\n$/, '')}
                    customStyle={customDivStyle}
                  />
                ) : (
                  <code className={className ? className : ''} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
