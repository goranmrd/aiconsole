import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import applescript from 'react-syntax-highlighter/dist/cjs/languages/prism/applescript';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/utils/styles';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('applescript', applescript);

interface MarkdownPreviewProps {
  text: string;
  disabled?: boolean;
}

const customDoccoStyle = {
  ...oneDark,
  'code[class*="language-"]': {
    backgroundColor: 'transparent',
  },
};

const customDivStyle = {
  backgroundColor: 'transparent',
  padding: 0,
};

const MarkdownPreview = ({ text, disabled }: MarkdownPreviewProps) => {
  return (
    <div className="w-1/2">
      <p className="font-bold mb-4">Preview</p>
      <div className="bg-black/20 p-3 w-full h-full max-h-[540px] overflow-y-auto">
        <div
          className={cn('prose prose-default w-full', {
            'opacity-[0.7] ': disabled,
          })}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, rehypeHighlight]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');

                return match ? (
                  <SyntaxHighlighter
                    style={customDoccoStyle}
                    PreTag="div"
                    language={match[1]}
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
