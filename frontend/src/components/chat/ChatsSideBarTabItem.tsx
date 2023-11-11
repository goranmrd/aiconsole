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

import { useAICStore } from '@/store/AICStore';
import { ChatHeadline } from '@/types/types';
import { CHAT_COLOR, CHAT_ICON } from '@/utils/getAssetIcon';
import { useState } from 'react';
import SideBarItem from '../system/sidebar/SideBarItem';
import { useChatContextMenu } from '../../hooks/useChatContextMenu';

export function ChatsSideBarTabItem({ chat }: { chat: ChatHeadline }) {
  const [isEditing, setIsEditing] = useState(false);
  const { showContextMenu } = useChatContextMenu(chat, setIsEditing);


  const rename = (value: string, chatId: string) => {
    handleHeadlineChange(chatId, value);
  };

  const handleHeadlineChange = (chatId: string, newHeadline: string) => {
    useAICStore.getState().updateChatHeadline(chatId, newHeadline);
  };

  return (
    <SideBarItem
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      icon={CHAT_ICON}
      color={CHAT_COLOR}
      label={chat.message}
      linkTo={`/chats/${chat.id}`}
      onRename={(value) => rename(value, chat.id)}
      key={chat.id}
      onContextMenu={showContextMenu()}
    />
  );
}
