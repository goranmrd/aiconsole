import { useContextMenu as useMantineContextMenu, ContextMenuContent, ContextMenuOptions } from 'mantine-contextmenu';

export const CONTEXT_MENU_ITEM_CLASSES = '!text-white/90 bg-gray-700 hover:!bg-gray-600 !py-[7px] !px-[15px] !rounded-none my-[3px] !text-[16px]'

export function useContextMenu() {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useMantineContextMenu();

  function showContextMenuReplacement(content: ContextMenuContent, options?: ContextMenuOptions): React.MouseEventHandler<Element> {
    return showContextMenu(content, {
      classNames: {
        root: '!bg-gray-700 border !border-gray-800 !px-0 !py-[6px]',
        item: CONTEXT_MENU_ITEM_CLASSES,
        divider: 'bg-white/30',
      },
      ...options,
    });
  }

  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
