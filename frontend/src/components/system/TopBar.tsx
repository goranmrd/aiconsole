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

import { getBaseURL } from '@/api/Api';
import { useProjectContextMenu } from '@/hooks/useProjectContextMenu';
import { useProjectFileManager } from '@/hooks/useProjectFileManager';
import { useAICStore } from '@/store/AICStore';
import { useRecentProjectsStore } from '@/store/home/useRecentProjectsStore';
import { cn } from '@/utils/styles';
import { useDisclosure } from '@mantine/hooks';
import { FolderOpen, FolderPlus, PlusIcon } from 'lucide-react';
import { useAddMenu } from '../../hooks/useAddMenu';
import { useUserContextMenu } from '../../hooks/useUserContextMenu';
import { GlobalSettingsModal } from '../settings/GlobalSettingsModal';
import { Button } from './Button';
import { ConfirmationModal } from './ConfirmationModal';

interface TopBarProps {
  variant?: 'recentProjects' | 'chat';
}

export function TopBar({ variant = 'chat' }: TopBarProps) {
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
  const recentProjects = useRecentProjectsStore((state) => state.recentProjects);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const { showContextMenu: showProjectContextMenu } = useProjectContextMenu();
  const { showContextMenu: showPlusMenu } = useAddMenu();
  const { showContextMenu: showUserMenu } = useUserContextMenu(openSettings);

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
            <div className="flex text-sm gap-2 items-center pr-5">
              <Link
                to={`/chats/${uuidv4()}`}
                className="h-11 text-grey-300 font-bold  text-lg uppercase text-primary hover:animate-pulse cursor-pointer flex gap-2 items-center ml-[20px]"
                onContextMenu={showProjectContextMenu()}
              >
                {projectName}
              </Link>

              <Button
                small
                classNames="ml-10"
                variant="secondary"
                onClick={showPlusMenu()}
                onContextMenu={showPlusMenu()}
              >
                <PlusIcon />
                New
              </Button>
            </div>
          </>
        )}
        <div className="text-gray-300 ml-auto flex gap-[20px]">
          <div
            className={cn(
              'flex flex-col p-4 rounded-[10px] border border-transparent justify-end items-end  absolute top-[10px] right-[14px]',
            )}
          >
            <img
              src={`${getBaseURL()}/profile/user.jpg` || ''}
              className="h-11 w-11 rounded-full border cursor-pointer shadow-md border-primary mb-3"
              onClick={showUserMenu()}
              onContextMenu={showUserMenu()}
            />
            <GlobalSettingsModal onClose={closeSettings} isOpened={settingsOpened} />
          </div>
        </div>
      </div>
    </div>
  );
}
