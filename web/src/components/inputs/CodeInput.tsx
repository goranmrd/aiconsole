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
}

export function CodeInput({
  label,
  value,
  className,
  onChange,
  codeLanguage,
  disabled = false,
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
    <div className="w-1/2 h-full">
      <label htmlFor={label} className="font-bold">
        {label}:
      </label>
      <div className={cn(className, 'font-mono text-sm mt-4 h-full ')}>
        <Editor
          value={value}
          disabled={disabled}
          textareaId={label}
          onValueChange={handleValueChange}
          highlight={(code) => onHighlight(code)}
          padding={10}
          className={cn(
            'h-full resize-none bg-black/20 appearance-none border border-transparent rounded w-full py-2 px-3 leading-tight placeholder-gray-400',
          )}
          textareaClassName="focus:!outline-primary/50 focus:!shadow-outline"
        />
      </div>
    </div>
  );
}
