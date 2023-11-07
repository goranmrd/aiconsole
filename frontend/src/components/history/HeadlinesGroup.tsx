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

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ChatHeadline } from '@/types/types';
import SideBarItem from './SideBarItem';

export type HeadlinesGroupProps = {
  title: string;
  headlines: ChatHeadline[];
  currentChatId: string;
  onChatDelete: (e: React.MouseEvent, id: string) => void;
  onHeadlineChange: (chatId: string, newHeadline: string) => void;
};

const HeadlinesGroup = ({
  title,
  headlines,
  currentChatId,
  onChatDelete,
  onHeadlineChange,
}: HeadlinesGroupProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleLinkClick = (chatId: string) => {
    if (chatId !== currentChatId && isEditMode) {
      setIsEditMode(false);
    }
  };

  const rename = (value: string, chatId: string) => {
    onHeadlineChange(chatId, value);
  };

  return (
    <>
      <h3 className="uppercase px-[9px] py-[5px] text-gray-400 text-[12px] leading-[18px]">
        {title}
      </h3>
      {headlines.map((chat) => {
        const selected = chat.id == currentChatId;

        return (
          <Link
            to={`/chats/${chat.id}`}
            onClick={() => handleLinkClick(chat.id)}
            title={chat.message}
            key={chat.id}
          >
            <SideBarItem
              type="chats"
              active={selected}
              id={chat.id}
              label={chat.message}
              onDelete={(event) => onChatDelete(event, chat.id)}
              onRename={(value) => rename(value, chat.id)}
            />
          </Link>
        );
      })}
    </>
  );
};
export default HeadlinesGroup;
