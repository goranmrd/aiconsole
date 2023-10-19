import Editor from 'react-simple-code-editor';
import hljs from "highlight.js";
import 'highlight.js/styles/vs2015.css';

import { cn } from "@/utils/styles";

interface CodeInputProps {
  label: string;
  value: string;
  className?: string;
  onChange: (value: string) => void;
  codeLanguage?: string;
}

export function CodeInput({
  label,
  value,
  className,
  onChange,
  codeLanguage
}: CodeInputProps) {

  const onHighlight = (code: string) => {
    let lang = codeLanguage
    if (!lang) {
      const { language } = hljs.highlightAuto(code)
      lang = language
    }
    return hljs.highlight(code, {language: lang || 'python'}).value
  }


  return (
    <>
      <label htmlFor={label} className="font-bold">
        {label}:
      </label>
      <div className={cn(className, "overflow-y-auto font-mono text-sm")}>
      <Editor
          value={value}
          textareaId={label}
          onValueChange={code => onChange(code)}
          highlight={code => onHighlight(code)}
          padding={10}
          className={cn(
            'h-full resize-none bg-black/20 appearance-none border border-transparent rounded w-full py-2 px-3 leading-tight placeholder-gray-400',
          )}
          textareaClassName='focus:!outline-primary/50 focus:!shadow-outline'
        />
      </div>

    </>
  );
}
