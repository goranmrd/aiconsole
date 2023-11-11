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
