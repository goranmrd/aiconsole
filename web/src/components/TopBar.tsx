import { BASE_URL } from '../api/Api';

export function TopBar() {
  return (
    <div className="flex w-full flex-col p-6 border-b drop-shadow-md bg-black/30 border-black/30">
      <div className="flex gap-2 items-center">
        <img
          onClick={() => alert('Not implemented')}
          src={`/logo.png`}
          className="h-9 w-9 cursor-pointer hover:animate-pulse filter saturate-200 "
        />
        <h1 className="text-lg font-bold">AIConsole</h1>
        <div className="flex-grow"> </div>
        <img
          src={`${BASE_URL}/profile/user.jpg`}
          className="h-9 w-9 rounded-full border cursor-pointer shadow-md border-indigo-300"
          onClick={() => alert('Not implemented')}
        />
      </div>
    </div>
  );
}
