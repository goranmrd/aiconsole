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

import { Api } from '@/api/Api';
import { useContextMenu } from '@/hooks/useContextMenu';
import { XIcon } from 'lucide-react';

export function useProjectContextMenu() {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useContextMenu();

  const handleBackToProjects = () => Api.closeProject();

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
