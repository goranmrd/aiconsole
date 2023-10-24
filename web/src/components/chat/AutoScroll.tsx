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

import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function AutoScroll({ children, className }: Props) {
  const [autoScroll, setAutoScroll] = useState(true);
  const containerElement = useRef<HTMLDivElement>(null);
  const style = {
    overflow: 'auto',
    scrollBehavior: 'auto',
    pointerEvents: 'auto',
  } as const;

  const onWheel = () => {
    const { current } = containerElement;

    if (current) {
      setAutoScroll(
        current.scrollTop + current.offsetHeight === current.scrollHeight,
      );
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const { current } = containerElement;

      if (current) {
        current.style.scrollBehavior = 'auto';
      }
    }, 0);
  }, [containerElement]);

  useEffect(() => {
    if (!autoScroll) {
      return;
    }

    setTimeout(() => {
      const { current } = containerElement;

      if (current) {
        current.scrollTop = current.scrollHeight;
      }
    }, 10);
  }, [children, containerElement, autoScroll]);

  return (
    <div className={className}>
      <div onWheel={onWheel} ref={containerElement} style={style}>
        {children}
      </div>
    </div>
  );
}
