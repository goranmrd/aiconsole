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
