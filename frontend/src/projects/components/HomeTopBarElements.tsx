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

import { useProjectFileManager } from '@/projects/useProjectFileManager';
import { useRecentProjectsStore } from '@/projects/useRecentProjectsStore';
import { FolderOpen, FolderPlus } from 'lucide-react';
import { Button } from '../../common/components/Button';
import { ConfirmationModal } from '../../common/components/ConfirmationModal';


export function HomeTopBarElements() {
  const {
    isProjectDirectory, isNewProjectModalOpen, isOpenProjectModalOpen, openProject, newProject, resetIsProjectFlag, openProjectConfirmation,
  } = useProjectFileManager();
  const recentProjects = useRecentProjectsStore((state) => state.recentProjects);

  return (
    recentProjects.length > 0 && (
      <div className="flex gap-[20px]">
        <ConfirmationModal
          confirmButtonText="Yes"
          cancelButtonText="No"
          opened={isProjectDirectory === true && isNewProjectModalOpen}
          onClose={resetIsProjectFlag}
          onConfirm={openProjectConfirmation}
          title={`This project already exists, do you want to open it?`} />
        <ConfirmationModal
          confirmButtonText="Yes"
          cancelButtonText="No"
          opened={isProjectDirectory === false && isOpenProjectModalOpen}
          onClose={resetIsProjectFlag}
          onConfirm={openProjectConfirmation}
          title={`This project does not exists, do you want to create one?`} />

        <Button small onClick={newProject}>
          <FolderPlus /> New Project ...
        </Button>

        <Button small variant="secondary" onClick={openProject}>
          <FolderOpen /> Open Project ...
        </Button>
      </div>
    )
  );
}
