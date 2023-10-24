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

import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';

import { useAICStore } from '@/store/AICStore';
import useGroupByDate from '@/hooks/useGroupByDate';
import HeadlinesGroup from '@/components/HeadlinesGroup';

const SideBar = () => {
  const chatHeadlines = useAICStore((state) => state.chatHeadlines);
  const chatId = useAICStore((state) => state.chatId);

  const { today, yesterday, previous7Days, older } =
    useGroupByDate(chatHeadlines);

  function handleDelete(event: React.MouseEvent, id: string) {
    event.stopPropagation();
    event.preventDefault();

    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    useAICStore.getState().deleteChat(id);
    useAICStore.getState().setChatId(uuidv4());
  }

  const handleHeadlineChange = (chatId: string, newHeadline: string) => {
    useAICStore.getState().updateChatHeadline(chatId, newHeadline);
  };

  return (
    <div
      className={`min-w-[240px] w-[240px] h-full bg-gray-900/30 p-1 drop-shadow-md flex flex-col border-r border-white/10`}
    >
      <Link to={`/chats/${uuidv4()}`} className="cursor-pointer p-6 flex font-bold text-sm">
        <button className=" bg-white/5 w-full hover:bg-white/10 p-2 h-10 rounded-full flex flex-row gap-2 items-center border border-white/10 pl-3 pr-2">
          <span className="flex-grow text-left">New Chat</span>{' '}
          <PlusIcon className="w-5 h-5" />
        </button>
      </Link>
      <div className="overflow-y-auto flex flex-col text-sm">
        {!!today.length && (
          <HeadlinesGroup
            title="Today"
            headlines={today}
            currentChatId={chatId}
            onChatDelete={handleDelete}
            onHeadlineChange={handleHeadlineChange}
          />
        )}
        {!!yesterday.length && (
          <HeadlinesGroup
            title="Yesterday"
            headlines={yesterday}
            currentChatId={chatId}
            onChatDelete={handleDelete}
            onHeadlineChange={handleHeadlineChange}
          />
        )}
        {!!previous7Days.length && (
          <HeadlinesGroup
            title="Previous 7 days"
            headlines={previous7Days}
            currentChatId={chatId}
            onChatDelete={handleDelete}
            onHeadlineChange={handleHeadlineChange}
          />
        )}
        {!!older.length && (
          <HeadlinesGroup
            title="Older than 7 days"
            headlines={older}
            currentChatId={chatId}
            onChatDelete={handleDelete}
            onHeadlineChange={handleHeadlineChange}
          />
        )}
      </div>
    </div>
  );
};

export default SideBar;
