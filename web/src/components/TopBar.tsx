import { Bars3Icon } from '@heroicons/react/24/solid';
import { BASE_URL } from '../api/Api';
import { useUIStore } from '../store/useUIStore';

export function TopBar() {
  const isSidebarVisible = useUIStore((state) => state.isSidebarOpened);
  const setIsSidebarVisible = useUIStore((state) => state.setSidebarOpened);

  return (
    <div className="flex w-full flex-col p-4 border-b drop-shadow-md  bg-stone-800/20 border-black/30">
      <div className="flex items-center gap-2">
        {!isSidebarVisible && (
          <button onClick={() => setIsSidebarVisible(true)}>
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        <div className="flex gap-2" onClick={() => alert('Not implemented')}>
          <img
            src={`/logo.png`}
            className="h-8 w-8 cursor-pointer hover:animate-pulse filter saturate-200 "
            
          />
          <div>AIConsole</div>
        </div>
        <div className="flex-grow"> </div>
        <img
          src={`${BASE_URL}/profile/user.jpg`}
          className="h-8 w-8 rounded-full border-2 cursor-pointer  border-gray-500"
          onClick={() => alert('Not implemented')}
        />
      </div>
    </div>
  );
}
