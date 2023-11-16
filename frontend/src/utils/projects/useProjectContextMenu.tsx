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

import { useContextMenu } from '@/utils/common/useContextMenu';
import { XIcon } from 'lucide-react';
import { ProjectsAPI } from '@/api/api/ProjectsAPI';
import { localStorageTyped } from '../common/localStorage';

const { getItem: checkIfChanged } = localStorageTyped<boolean>('isAssetChanged');

export function useProjectContextMenu() {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useContextMenu();

  const handleBackToProjects = () => {
    if (
      checkIfChanged() &&
      !window.confirm(`Are you sure you want to leave this project? Any unsaved changes will be lost.`)
    ) {
      return;
    }

    ProjectsAPI.closeProject();
  };

  function showContextMenuReplacement() {
    return showContextMenu([
      {
        key: 'Close Project',
        icon: <XIcon className="w-4 h-4" />,
        title: 'Close Project',
        onClick: handleBackToProjects,
      },
    ]);
  }

  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
