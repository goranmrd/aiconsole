import { create } from 'zustand';

export type UIStore = {
  isSidebarOpened: boolean;
  setSidebarOpened: (isSidebarOpened: boolean) => void;
};


// Create Zustand store
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useUIStore = create<UIStore>((set, _get) => ({
  isSidebarOpened: true,

  setSidebarOpened: (isSidebarOpened: boolean) => {
    set(() => ({ isSidebarOpened }));
  }
  
}));
