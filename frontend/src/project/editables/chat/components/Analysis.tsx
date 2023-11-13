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

import { BlinkingCursor } from '@/project/editables/chat/components/BlinkingCursor';
import { cn } from '@/common/cn';
import { UserInfo } from '@/project/editables/chat/components/UserInfo';
import { useChatStore } from '../store/useChatStore';

export function Analysis() {
  const currentAnalysisRequestId = useChatStore(store => store.currentAnalysisRequestId);
  const agent_id = useChatStore(store => store.agent_id);
  const relevant_material_ids = useChatStore(store => store.relevant_material_ids);
  const thinking_process = useChatStore(store => store.thinking_process);
  const next_step = useChatStore(store => store.next_step);

  if (currentAnalysisRequestId) {
    return (
      <div className={cn('flex flex-row py-10 text-stone-400/50')}>
        <div className="container flex mx-auto gap-5 ">
          <UserInfo
            agent_id={
              agent_id !== 'user' ? agent_id || '' : ''
            }
            materials_ids={
              agent_id !== 'user'
                ? relevant_material_ids || []
                : []
            }
          />
          <div className="flex-grow mr-20">
            Analysing ...
            {<>{` ${thinking_process || ''}`}{' '}
            {next_step && (
              <>
                <br /> Next step:{' '}
                <span className="text-secondary/50 leading-[24px]">
                  {next_step}
                </span>
              </>
            )}{' '}</>}
            <BlinkingCursor />
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
