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

import { cn } from '@/utils/common/cn';
import { Button } from '@/components/common/Button';
import { useRecentProjectsStore } from '@/store/projects/useRecentProjectsStore';
import { MessageSquare, X } from 'lucide-react';
import { MouseEvent, useState } from 'react';
import { useProjectStore } from '../../store/projects/useProjectStore';

interface ProjectCardProps {
  name: string;
  path: string;
  chatHistory: string[];
}

export function ProjectCard({ name, path, chatHistory }: ProjectCardProps) {
  const chooseProject = useProjectStore((state) => state.chooseProject);
  const removeRecentProject = useRecentProjectsStore((state) => state.removeRecentProject);
  const [isDeleteHovered, setDeleteHovered] = useState(false);

  const deleteProject = async (event: MouseEvent) => {
    event.stopPropagation();
    await removeRecentProject(path);
  };

  const goToProjectChat = () => {
    chooseProject(path);
  };

  return (
    <div
      className="group border-2 border-gray-600 p-[30px] rounded-[20px] max-w-[435px] w-full opacity-75 transition-opacity  cursor-pointer bg-gray-900 hover:opacity-100"
      onClick={goToProjectChat}
    >
      <div className="flex flex-row items-center w-full mb-[30px]">
        <div className="flex-grow align-left">
          <Button variant="tertiary" classNames="p-0 m-0">
            <h3
              className={cn(
                !isDeleteHovered && 'group-hover:text-secondary',
                'text-[22px] font-black  transition-colors',
              )}
            >
              {name}
            </h3>
          </Button>
        </div>
        <Button
          variant="tertiary"
          classNames="mt-[5px] opacity-0 group-hover:opacity-100 transition-all duration-700 p-0 m-0"
          onMouseEnter={() => setDeleteHovered(true)}
          onMouseLeave={() => setDeleteHovered(false)}
          onClick={deleteProject}
        >
          <X className="scale-150" />
        </Button>
      </div>

      {chatHistory.map((command, index) => (
        // make it single line and end with  ...
        <div key={index} className="flex flex-row items-center gap-2 mb-[10px] text-[15px]">
          <MessageSquare className="flex-none w-4 h-4 opacity-50" />
          <div className="flex-grow truncate">{command} </div>
        </div>
      ))}
    </div>
  );
}
