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

import { ReactNode } from 'react';

export type PillProps = {
  children: ReactNode;
  color?: string;
  title?: string;
};

export function Pill({ children, title }: PillProps) {
  return (
    <span
      title={title}
      className="rounded-full align-middle px-2 py-1 ml-1 shadow-md overflow-ellipsis overflow-hidden h-8 w-24 max-w-xl bg-primary inline-block whitespace-nowrap text-center"
    >
      {children}
    </span>
  );
}
