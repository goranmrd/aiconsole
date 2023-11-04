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

import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { useAICStore } from '@/store/AICStore';
import showNotification from '@/utils/showNotification';
import { Button } from './Button';
import { ArrowLeft, Settings, FolderOpen, FolderPlus } from 'lucide-react';
import { Api } from '@/api/Api';

interface TopBarProps {
  variant?: 'recentProjects' | 'chat';
}

export function TopBar({ variant = 'chat' }: TopBarProps) {
  const chooseProject = useAICStore((state) => state.chooseProject);
  const projectName = useAICStore((state) => state.projectName);
  const isProjectOpen = useAICStore((state) => state.isProjectOpen());

  const handleOpenClick = () => chooseProject();

  const handleBackToProjects = () => Api.closeProject();

  return (
    <div className="flex w-full flex-col px-[30px] py-[26px] border-b drop-shadow-md bg-transparent border-white/10">
      <div className="flex gap-2 items-center">
        {variant === 'recentProjects' ? (
          <div className="flex gap-[20px]">
            <Button small>
            <FolderPlus /> New Project ... 
            </Button>
            <Button small variant="secondary"  onClick={handleOpenClick}>
              <FolderOpen /> Open Project ...
            </Button>
          </div>
        ) : (
          <>
            <div className="flex font-bold text-sm gap-2 items-center pr-5">
              <Link
                className="hover:animate-pulse cursor-pointer flex gap-2 items-center mr-[20px]"
                to={`/chats/${uuidv4()}`}
              >
                <img src={`favicon.svg`} className="h-[48px] w-[48px] cursor-pointer filter" />
              </Link>
              <Button small variant="secondary" onClick={handleBackToProjects}>
                <ArrowLeft />
                Back to projects
              </Button>
              <h3 className="font-black text-grey-300 ml-[70px] first-letter:uppercase">
                {projectName}
              </h3>
            </div>
            {/* TODO: remove "materials" and "agents" links when sidebar ready */}
            <div className="flex gap-4">
              <Link to="/materials" className="cursor-pointer text-sm  hover:text-gray-400 hover:animate-pulse">
                MATERIALS
              </Link>
              <Link
                to="/materials"
                className="cursor-pointer text-sm hover:text-gray-400 hover:animate-pulse"
                onClick={() =>
                  showNotification({
                    title: 'Not implemented',
                    message: 'Agents listing is not implemented yet',
                    variant: 'error',
                  })
                }
              >
                AGENTS
              </Link>
            </div>
          </>
        )}
        <div className="ml-auto flex gap-[20px]">
          {isProjectOpen && <Button
            small
            variant="secondary"
            onClick={() =>
              showNotification({
                title: 'Not implemented',
                message: 'Project settings is not implemented yet',
                variant: 'error',
              })
            }
          >
            Project {projectName} settings
          </Button> }
          <Button
            iconOnly
            small
            variant="secondary"
            onClick={() =>
              showNotification({
                title: 'Not implemented',
                message: 'Settings is not implemented yet',
                variant: 'error',
              })
            }
          >
            <Settings />
          </Button>
        </div>
      </div>
    </div>
  );
}
