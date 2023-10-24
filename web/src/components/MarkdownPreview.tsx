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

const MarkdownPreview = ({ text }: MarkdownPreviewProps) => {
  return (
    <div className="prose prose-default w-full">
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
  );
};

export default MarkdownPreview;
