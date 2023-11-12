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

import { useContextMenu } from '@/hooks/useContextMenu';
import { Settings } from 'lucide-react';
import { ContextMenuItemOptions } from 'mantine-contextmenu';

export function useUserContextMenu(openSettings: () => void) {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useContextMenu();

  function showContextMenuReplacement(content: ContextMenuItemOptions[] = []) {
    return showContextMenu([
      ...content,
      {
        key: 'Settings',
        icon: <Settings className="w-4 h-4" />,
        title: 'Settings',
        onClick: () => {
          openSettings();
        },
      },
    ]);
  }

  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
