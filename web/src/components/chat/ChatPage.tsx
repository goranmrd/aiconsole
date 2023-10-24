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
    
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import SideBar from '@/components/history/SideBar';
import { CommandInput } from '@/components/materials/CommandInput';
import { TopBar } from '@/components/top/TopBar';
import { Chat } from '@/components/chat/Chat';
import { useAICStore } from '@/store/AICStore';

export function ChatPage() {
  const { chat_id } = useParams<{ chat_id: string | undefined }>();

  const projectPath = useAICStore((state) => state.projectPath);

  const navigate = useNavigate();

  useEffect(() => {
    if (!chat_id) {
      navigate(`/chats/${uuidv4()}`);
    }
  }, [chat_id, navigate]);

  useEffect(() => {
    navigate(`/chats/${uuidv4()}`);
  }, [projectPath, navigate]);

  return (
    <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400">
      <TopBar />

      <div className="flex flex-row h-full overflow-y-auto">
        <SideBar />
        {chat_id && (
          <div className="flex w-full flex-col justify-between downlight">
            <Chat chatId={chat_id} />

            <CommandInput className="flex-none" />
          </div>
        )}
      </div>
    </div>
  );
}
