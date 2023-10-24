import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/utils/styles';

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
    <div className="w-1/2">
      <p className="font-bold mb-4">Preview of markdown text to be injected into AI context:</p>
      <div className="bg-black/20 p-3 w-full h-full max-h-[540px] overflow-y-auto">
        <div
          className={cn('prose prose-default w-full', {
            'opacity-[0.7] ': disabled,
          })}
        >
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');

                return match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
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
