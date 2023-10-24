import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';

import { cn } from '@/utils/styles';

interface CodeInputProps {
  label: string;
  value: string;
  className?: string;
  onChange?: (value: string) => void;
  codeLanguage?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export function CodeInput({
  label,
  value,
  className,
  onChange,
  codeLanguage,
  disabled = false,
  readOnly = false,
}: CodeInputProps) {
  const onHighlight = (code: string) => {
    let lang = codeLanguage;
    if (!lang) {
      const { language } = hljs.highlightAuto(code);
      lang = language;
    }
    return hljs.highlight(code, { language: lang || 'python' }).value;
  };

  const handleValueChange = (code: string) => {
    if (onChange) {
      onChange(code);
    }
  };

  return (
    <div className="w-1/2 ">
      <label htmlFor={label} className="font-bold">
        {label}:
      </label>
      <div
        className={cn(
          className,
          'font-mono text-sm h-full mt-4 overflow-y-auto max-h-[540px]',
        )}
      >
        <Editor
          value={value}
          disabled={disabled || readOnly}
          textareaId={label}
          onValueChange={handleValueChange}
          highlight={(code) => onHighlight(code)}
          padding={10}
          className={cn(
            'min-h-full resize-none bg-black/20 appearance-none border border-transparent rounded w-full py-2 px-3 leading-tight placeholder-gray-400 bottom-0',
            { 'opacity-[0.7] ': disabled },
          )}
          textareaClassName={cn(
            'focus:!outline-primary/50 focus:!shadow-outline',
            {
              'cursor-not-allowed': disabled,
            },
          )}
        />
      </div>
    </div>
  );
}
