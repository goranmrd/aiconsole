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

import { useProjectFileManager } from '@/utils/projects/useProjectFileManager';
import { FolderOpen, FolderPlus } from 'lucide-react';
import { Button } from '../common/Button';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { cn } from '@/utils/common/cn';

interface ProjectButtonsProps {
  className?: string;
}

export function ProjectButtons({ className }: ProjectButtonsProps): JSX.Element {
  const {
    isProjectDirectory,
    isNewProjectModalOpen,
    isOpenProjectModalOpen,
    openProject,
    newProject,
    handleReset,
    openProjectConfirmation,
    tempPath,
  } = useProjectFileManager();

  return (
    <div className={cn(className)}>
      <ConfirmationModal
        confirmButtonText="Yes"
        cancelButtonText="No"
        opened={isProjectDirectory === true && isNewProjectModalOpen && Boolean(tempPath)}
        onClose={handleReset}
        onConfirm={openProjectConfirmation}
        title={`This folder already contains an AIConsole project`}
      >
        Do you want to open it instead?
      </ConfirmationModal>
      <ConfirmationModal
        confirmButtonText="Yes"
        cancelButtonText="No"
        opened={isProjectDirectory === false && isOpenProjectModalOpen && Boolean(tempPath)}
        onClose={handleReset}
        onConfirm={openProjectConfirmation}
        title={`There is no project in this directory`}
      >
        Do you want to create one there instead?
      </ConfirmationModal>

      <Button small onClick={newProject}>
        <FolderPlus /> New Project ...
      </Button>

      <Button small variant="secondary" onClick={openProject}>
        <FolderOpen /> Open Project ...
      </Button>
    </div>
  );
}
