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

import { useContextMenu as useMantineContextMenu, ContextMenuContent, ContextMenuOptions } from 'mantine-contextmenu';

export const CONTEXT_MENU_ITEM_CLASSES =
  'text-white bg-gray-700 hover:bg-gray-600 py-[7px] px-[15px] rounded-none my-[3px] hover:!text-white !text-[16px] context-menu-icon';

const CLASSNAMES = {
  root: '!bg-gray-700 border !border-gray-800 !px-0 !py-[6px] rounded-[4px] text-gray-400',
  item: CONTEXT_MENU_ITEM_CLASSES,
  divider: 'bg-gray-800',
};

export function useContextMenu() {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useMantineContextMenu();

  function showContextMenuReplacement(
    content: ContextMenuContent,
    options?: ContextMenuOptions,
  ): React.MouseEventHandler<Element> {
    return showContextMenu(content, {
      classNames: CLASSNAMES,
      ...options,
    });
  }

  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
