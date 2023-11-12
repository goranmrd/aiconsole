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

import { useAICStore } from '@/store/AICStore';
import { useEffect, useCallback, useState } from 'react';

export const useProjectFileManager = () => {
  const [isNewProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [isOpenProjectModalOpen, setOpenProjectModalOpen] = useState(false);
  const chooseProject = useAICStore((state) => state.chooseProject);
  const resetIsProjectFlag = useAICStore((state) => state.resetIsProjectFlag);
  const checkPath = useAICStore((state) => state.checkPath);
  const tempPath = useAICStore((state) => state.tempPath);
  const isProjectDirectory = useAICStore((state) => state.isProjectDirectory);

  const openProjectConfirmation = useCallback(() => {
    chooseProject(tempPath);
    resetIsProjectFlag();
  }, [chooseProject, resetIsProjectFlag, tempPath]);

  useEffect(() => {
    if (isProjectDirectory === false && isNewProjectModalOpen) {
      openProjectConfirmation();
      return;
    }
    if (isProjectDirectory === true && isOpenProjectModalOpen) {
      openProjectConfirmation();
      return;
    }
  }, [
    openProjectConfirmation,
    isNewProjectModalOpen,
    isOpenProjectModalOpen,
    isProjectDirectory,
  ]);

  const openProject = () => {
    checkPath();
    setOpenProjectModalOpen(true);
    setNewProjectModalOpen(false);
  };

  const newProject = () => {
    checkPath();
    setNewProjectModalOpen(true);
    setOpenProjectModalOpen(false);
  };

  useEffect(() => {
    resetIsProjectFlag();
  }, [resetIsProjectFlag]);

  return {
    newProject,
    openProject,
    isProjectDirectory,
    isNewProjectModalOpen,
    isOpenProjectModalOpen,
    resetIsProjectFlag,
    openProjectConfirmation,
  };
};
