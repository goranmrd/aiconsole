import { BASE_URL } from '../api/Api';
import { Link } from 'react-router-dom';

export function TopBar() {
  return (
    <div className="flex w-full flex-col p-6 border-b drop-shadow-md bg-gray-900/30 border-white/10">
      <div className="flex gap-2 items-center">
        <Link to="/" className="cursor-pointer flex font-bold text-sm gap-2 items-center">
          <img
            src={`/favicon.svg`}
            className="h-9 w-9 cursor-pointer hover:animate-pulse filter saturate-200 "
          />
          <h1 className="text-lg font-bold text-white">AIConsole</h1>
        </Link>
        <div className="flex-grow"></div>
        <img
          src={`${BASE_URL}/profile/user.jpg`}
          className="h-9 w-9 rounded-full border cursor-pointer shadow-md border-primary"
          onClick={() => alert('Not implemented')}
        />
      </div>
    </div>
  );
}
