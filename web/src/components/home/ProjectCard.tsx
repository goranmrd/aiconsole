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

import { MouseEvent } from 'react';
import { Button } from '../system/Button';
import { X } from 'lucide-react';
import { useAICStore } from '@/store/AICStore';

interface ProjectCardProps {
  name: string;
  path: string;
  chatHistory: string[];
}

export function ProjectCard({ name, path, chatHistory }: ProjectCardProps) {
  const chooseProject = useAICStore((state) => state.chooseProject);
  const deleteProject = (event: MouseEvent) => {
    event.stopPropagation();
    // TODO: add delete project logic
  };

  const goToProjectChat = () => {
    chooseProject(path);
  };

  return (
    <div
      className="group border-2 border-gray-600 p-[30px] pb-[10px] rounded-[20px] max-w-[435px] w-full text-gray-400 cursor-pointer bg-gray-900"
      onClick={goToProjectChat}
    >
      <h3 className="text-[22px] font-black mb-[21px]">{name}</h3>
      {chatHistory.map((command, index) => (
        // make it single line and end with  ...
        <p key={index} className="mb-[10px] text-[15px] truncate">
          {command}
        </p>
      ))}
      <Button variant="tertiary" classNames="mt-[5px]  opacity-0 group-hover:opacity-100" onClick={deleteProject}>
        <X />
        Remove project
      </Button>
    </div>
  );
}
