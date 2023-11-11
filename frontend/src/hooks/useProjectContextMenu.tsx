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
