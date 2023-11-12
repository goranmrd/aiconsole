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
    
import { AICMessageGroup } from "../chatTypes";
import { cn } from '@/common/cn';
import { CodeMessage } from './messages/CodeMessage';
import { UserInfo } from '@/project/editables/chat/components/UserInfo';
import { TextMessage } from './messages/TextMessage';

export function MessageGroup({
  group,
  isStreaming,
}: {
  group: AICMessageGroup;
  isStreaming: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-row shadow-md border-t border-gray-900/50 py-10',
        group.role === 'user' ? 'bg-gray-800/20' : 'bg-gray-700/20',
      )}
    >
      <div className="container flex mx-auto gap-5">
        <UserInfo
          agent_id={group.agent_id}
          materials_ids={group.materials_ids}
          task={group.task}
        />
        <div className="flex-grow flex flex-col gap-5  overflow-auto">
          {group.messages.map((message, index) => (
            'language' in message ? (
              <CodeMessage
                key={message.id}
                group={group}
                message={message}
                isStreaming={index === group.messages.length - 1 && isStreaming}
              />
            ) : (
              <TextMessage
                key={message.id}
                message={message}
                group={group}
                isStreaming={index === group.messages.length - 1 && isStreaming}
              />
            )
          ))}
        </div>
      </div>
    </div>
  );
}
