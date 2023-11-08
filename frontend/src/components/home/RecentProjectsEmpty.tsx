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
import { Button } from '../system/Button';
import { FolderOpen, FolderPlus } from 'lucide-react';
import { useState } from 'react';

export function RecentProjectsEmpty() {
  const chooseProject = useAICStore((state) => state.chooseProject);
  const openAiApiKey = useAICStore((state) => state.openAiApiKey);

  const [inputText, setInputText] = useState('');

  const setOpenAiApiKey = useAICStore((state) => state.setOpenAiApiKey);

  const onFormSubmit = () => {
    setOpenAiApiKey(inputText);
  };

  const handleOpenClick = async () => {
    await chooseProject();
  };

  return (
    <div className="flex justify-center items-center flex-col min-h-[calc(100vh-181px)] px-[60px] m-20 relative">
      <div className="absolute top-50% translate-y-[-150%]">
        <img
          src="favicon.svg"
          className="shadows-lg w-[60px] h-[60px] mx-auto "
          alt="Logo"
        />
        <h1 className="text-[56px] text-center font-black text-white ">
          Welcome to <span className=" text-primary">AIConsole!</span>
        </h1>
        {openAiApiKey ? (
          <div className="flex justify-center gap-[20px] mt-[36px]">
            <Button small onClick={handleOpenClick}>
              <FolderPlus /> Create Your First Project ...
            </Button>
            <Button small variant="secondary" onClick={handleOpenClick}>
              <FolderOpen /> Open Project ...
            </Button>
          </div>
        ) : (
          <div className="mb-[-40px]">
            <p className="mt-10 mb-4 text-lg text-center font-semibold text-white">
              First, provide your OpenAI API key with GPT-4 access.
            </p>
            <div className="flex justify-center gap-5">
              <input
                className="border-white/20 ring-secondary/30 text-white bg-black flex-grow resize-none overflow-hidden rounded-3xl border px-4 py-2 focus:outline-none focus:ring-2"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="OpenAI API key..."
              />
              <Button small onClick={onFormSubmit} disabled={!inputText}>
                Submit
              </Button>
            </div>
          </div>
        )}
      </div>
      <img
        src="recent-projects-empty-image.png"
        className="mx-auto my-[100px]"
        alt="aiconsole chat image"
      />
    </div>
  );
}
