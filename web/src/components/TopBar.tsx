import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

import { BASE_URL } from '@/api/Api';
import { useAICStore } from '@/store/AICStore';

export function TopBar() {
  const chooseProject = useAICStore((state) => state.chooseProject);
  const projectName = useAICStore((state) => state.projectName);

  return (
    <div className="flex w-full flex-col p-6 border-b drop-shadow-md bg-gray-900/30 border-white/10">
      <div className="flex gap-2 items-center">
        <div className="cursor-pointer flex font-bold text-sm gap-2 items-center pr-5">
          <img src={`/favicon.svg`} className="h-9 w-9 cursor-pointer filter" />
          <Link className="hover:animate-pulse" to="/">
            <h1 className="text-lg font-bold text-white">AIConsole</h1>
          </Link>
          <span className="hover:animate-pulse" onClick={chooseProject}>
            <span className="text-sm"> / </span>
            {projectName}
          </span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/materials"
            className="cursor-pointer text-sm  hover:text-gray-400 hover:animate-pulse"
          >
            MATERIALS
          </Link>
          <Link
            to="/materials"
            className="cursor-pointer text-sm hover:text-gray-400 hover:animate-pulse"
            onClick={() =>
              notifications.show({
                title: 'Not implemented',
                message: 'Agents listing is not implemented yet',
                color: 'red',
              })
            }
          >
            AGENTS
          </Link>
        </div>

        <div className="flex-grow"></div>
        <img
          src={`${BASE_URL}/profile/user.jpg`}
          className="h-9 w-9 rounded-full border cursor-pointer shadow-md border-primary"
          onClick={() =>
            notifications.show({
              title: 'Not implemented',
              message: 'User profile is not implemented yet',
              color: 'red',
            })
          }
        />
      </div>
    </div>
  );
}
