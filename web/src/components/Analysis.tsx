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

import { BlinkingCursor } from '@/components/BlinkingCursor';
import { cn } from '@/utils/styles';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { UserInfo } from '@/components/UserInfo';

export function Analysis() {
  const analysis = useAnalysisStore();

  if (analysis.isAnalysisRunning || analysis.thinking_process) {
    return (
      <div className={cn('flex flex-row py-10 text-stone-400/50')}>
        <div className="container flex mx-auto gap-5">
          <UserInfo
            agent_id={
              analysis.agent_id !== 'user' ? analysis.agent_id || '' : ''
            }
            materials_ids={
              analysis.agent_id !== 'user'
                ? analysis.relevant_material_ids || []
                : []
            }
          />
          <div className="flex-grow mr-20">
            Analysing ...
            {` ${analysis.thinking_process || ''}`}{' '}
            {analysis.next_step && (
              <>
                <br /> Next step:{' '}
                <span className="text-secondary/50">{analysis.next_step}</span>
              </>
            )}{' '}
            {analysis.isAnalysisRunning && <BlinkingCursor />}
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
