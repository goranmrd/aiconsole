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

import { useContextMenu } from '@/hooks/useContextMenu';
import { useAICStore } from '@/store/AICStore';
import { ChatHeadline } from '@/types/types';
import { Copy, Edit, File, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function handleDelete(id: string) {
  if (!window.confirm('Are you sure you want to delete this chat?')) {
    return;
  }

  useAICStore.getState().deleteChat(id);
  useAICStore.getState().setChatId(uuidv4());
}

export function useChatContextMenu(chat: ChatHeadline, setIsEditing: (isEditing: boolean) => void) {
  const { showContextMenu } = useContextMenu();
  const navigate = useNavigate();

  function showContextMenuReplacement() {
    return showContextMenu([
      {
        key: 'Open',
        icon: <File className="w-4 h-4" />,
        title: 'Open',
        onClick: () => {
          navigate(`/chats/${chat.id}`);
        },
      },
      {
        key: 'Edit as New',
        icon: <Copy className="w-4 h-4" />,
        title: 'Edit as New',
        onClick: () => {
          navigate(`/chats/${uuidv4()}?copy=${chat.id}`);
        },
      },
      {
        key: 'Rename',
        icon: <Edit className="w-4 h-4" />,
        title: 'Rename',
        onClick: () => {
          setIsEditing(true);
        },
      },
      {
        key: 'Delete',
        icon: <Trash className="w-4 h-4" />,
        title: 'Delete',
        onClick: () => handleDelete(chat.id),
      },
    ]);
  }

  return { showContextMenu: showContextMenuReplacement };
}
