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
import { ArrowLeft, FolderOpen, FolderPlus } from 'lucide-react';
import { Api, getBaseURL } from '@/api/Api';
import { useRecentProjectsStore } from '@/store/home/useRecentProjectsStore';
import { MouseEvent, useEffect, useState } from 'react';
import { cn } from '@/utils/styles';
import { GlobalSettings } from '../settings/GlobalSettings';
import ImageWithFallback from './ImageWithFallback';
import { ConfirmationModal } from './ConfirmationModal';
import { useProjectFileManager } from '@/hooks/useProjectFileManager';

interface TopBarProps {
  variant?: 'recentProjects' | 'chat';
}

export function TopBar({ variant = 'chat' }: TopBarProps) {
  const [isMenuActive, setMenuActive] = useState(false);
  const {
    isProjectDirectory,
    isNewProjectModalOpen,
    isOpenProjectModalOpen,
    openProject,
    newProject,
    resetIsProjectFlag,
    openProjectConfirmation,
  } = useProjectFileManager();
  const projectName = useAICStore((state) => state.projectName);
  const isProjectOpen = useAICStore((state) => state.isProjectOpen());
  const recentProjects = useRecentProjectsStore(
    (state) => state.recentProjects,
  );

  const hideMenu = () => setMenuActive(false);

  useEffect(() => {
    window.addEventListener('click', hideMenu);

    return () => {
      window.removeEventListener('click', hideMenu);
    };
  }, []);

  const handleBackToProjects = () => Api.closeProject();

  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    setMenuActive((prev) => !prev);
  };

  return (
    <div className="flex w-full flex-col px-[30px] py-[26px] border-b drop-shadow-md bg-transparent border-white/10 relative z-40 h-[101px]">
      <div className="flex gap-2 items-center">
        {variant === 'recentProjects' ? (
          recentProjects.length > 0 && (
            <div className="flex gap-[20px]">
              <ConfirmationModal
                confirmButtonText="Yes"
                cancelButtonText="No"
                opened={isProjectDirectory === true && isNewProjectModalOpen}
                onClose={resetIsProjectFlag}
                onConfirm={openProjectConfirmation}
                title={`This project already exists, do you want to open it?`}
              />
              <ConfirmationModal
                confirmButtonText="Yes"
                cancelButtonText="No"
                opened={isProjectDirectory === false && isOpenProjectModalOpen}
                onClose={resetIsProjectFlag}
                onConfirm={openProjectConfirmation}
                title={`This project does not exists, do you want to create one?`}
              />

              <Button small onClick={newProject}>
                <FolderPlus /> New Project ...
              </Button>

              <Button small variant="secondary" onClick={openProject}>
                <FolderOpen /> Open Project ...
              </Button>
            </div>
          )
        ) : (
          <>
            <div className="flex font-bold text-sm gap-2 items-center pr-5">
              <Link
                className="hover:animate-pulse cursor-pointer flex gap-2 items-center mr-[20px]"
                to={`/chats/${uuidv4()}`}
              >
                <img
                  src="favicon.svg"
                  className="h-[48px] w-[48px] cursor-pointer filter"
                />
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
              <Link
                to="/materials"
                className="cursor-pointer text-sm  hover:text-gray-400 hover:animate-pulse"
              >
                MATERIALS
              </Link>
            </div>
          </>
        )}
        <div
          className="text-gray-300 ml-auto flex gap-[20px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cn(
              'flex flex-col p-4 rounded-[10px] border border-transparent justify-end items-end  absolute top-[10px] right-[14px]',
              {
                'bg-gray-900 shadow  border-gray-700': isMenuActive,
              },
            )}
          >
            <ImageWithFallback
              src={`${getBaseURL()}/profile/user.jpg` || ''}
              fallback="avatar-fallback.png"
              className="h-11 w-11 rounded-full border cursor-pointer shadow-md border-primary mb-3"
              onClick={toggle}
            />
            {isMenuActive && (
              <>
                <div className="border-t border-gray-700 w-full my-[14px]"></div>
                {isProjectOpen && false && (
                  <div
                    className="text-[14px] p-[8px] rounded-[5px] hover:bg-gray-700 cursor-pointer gap-[10px] w-full mb-[5px]"
                    onClick={() =>
                      showNotification({
                        title: 'Not implemented',
                        message: 'Project settings is not implemented yet',
                        variant: 'error',
                      })
                    }
                  >
                    Project <span className="text-primary">{projectName} </span>{' '}
                    settings
                  </div>
                )}
                <GlobalSettings onClose={hideMenu} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
