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

import { cn } from '@/utils/common/cn';
import { FocusEvent, useState } from 'react';

interface CodeInputProps {
  label?: string;
  value: string;
  className?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  codeLanguage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  transparent?: boolean;
}

export function CodeInput({
  label,
  value,
  className,
  onChange,
  onBlur,
  codeLanguage,
  disabled = false,
  readOnly = false,
  transparent = false,
}: CodeInputProps) {
  const [focus, setFocus] = useState(false);
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

  const handleBlur = (e: FocusEvent<HTMLDivElement> & FocusEvent<HTMLTextAreaElement>) => {
    if (e.relatedTarget?.tagName.toUpperCase() === 'BUTTON') {
      return;
    }

    setFocus(false);
    onBlur?.();
  };

  const handleFocus = () => setFocus(true);

  return (
    <div className="h-full">
      {label && (
        <label htmlFor={label} className="font-bold block mb-4">
          {label}:
        </label>
      )}
      <div
        className={cn(
          className,
          'font-mono text-sm overflow-y-auto h-full  max-h-[calc(100%-50px)] bg-black/20 border border-transparent rounded',
          { 'border-primary/50 ': focus },
        )}
      >
        <Editor
          value={value}
          disabled={disabled || readOnly}
          textareaId={label}
          onValueChange={handleValueChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          highlight={(code) => onHighlight(code)}
          padding={10}
          className={cn(
            'resize-none  appearance-none border border-transparent rounded w-full leading-tight placeholder-gray-400 bottom-0 p-0 h-full',
            {
              'opacity-[0.7] ': disabled,
              'bg-transparent': transparent,
            },
          )}
          textareaClassName={cn('focus:!outline-none focus:!shadow-none h-full', {
            'cursor-not-allowed': disabled,
          })}
        />
      </div>
    </div>
  );
}
