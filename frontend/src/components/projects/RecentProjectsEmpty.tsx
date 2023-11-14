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

import OpenAiApiKeyForm from '@/components/settings/OpenAiApiKeyForm';
import { HomeTopBarElements } from './HomeTopBarElements';

interface RecentProjectsEmptyProps {
  openAiApiKey: string | null | undefined;
  isApiKeyValid: boolean | undefined;
}

export function RecentProjectsEmpty({ openAiApiKey, isApiKeyValid }: RecentProjectsEmptyProps) {
  return (
    <div className="flex justify-center items-center flex-col min-h-[100vh] p-[60px] pt-[140px]  relative">
      <div className="absolute top-50% translate-y-[-150%]">
        <img src="favicon.svg" className="shadows-lg w-[60px] h-[60px] mx-auto " alt="Logo" />
        <h1 className="text-[56px] text-center font-black text-white ">
          Welcome to <span className=" text-primary">AIConsole!</span>
        </h1>
        Ł
        {openAiApiKey && isApiKeyValid ? (
          <HomeTopBarElements className="flex justify-center gap-[20px] mt-[36px]" />
        ) : (
          <div className="mb-[-40px]">
            <OpenAiApiKeyForm />
          </div>
        )}
      </div>
      <img src="recent-projects-empty-image.png" className="mx-auto mt-[100px] " alt="aiconsole chat image" />
    </div>
  );
}
