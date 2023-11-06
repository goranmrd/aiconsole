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

const keyAspects = [
  {
    title: 'Your Personal AI Universe',
    description:
      'Construct your own personal AIs, fitted to your bespoke requirements. Spend time on your tool, and watch it grow better and sharper with time.',
    btnText: 'Guide me through building my personal assistant using AIConsole.',
  },

  {
    title: 'Teach Your AI New Tricks',
    description:
      "Make your AI tool adapt over time. Add and manage materials to create a progressively evolving AIConsole that'd serve you even better.",
    btnText: 'How does the AI adapt and improve in AIConsole?',
  },
  {
    title: 'Build Domain-Specific Tools',
    description:
      'Engineer domain tools for the AIConsole, personalizing it to cater to niche tasks and specifications.',
    btnText:
      'How to develop and customize my domain-specific tools in AIConsole?',
  },
  {
    title: 'Run It Locally',
    description:
      'Execute AIConsole on your local machine rendering a secure and convenient operation.',
    btnText:
      "Can you tell me more about running AIConsole locally and it's security aspects?",
  },
  {
    title: 'Learn the Web Interface',
    description:
      'Navigate through our simplified, user-friendly web interface, that makes your tasks easier to understand and more engaging to complete.',
    btnText:
      'I would like to know more about the AIConsole web interface, what are its specific features?',
  },
  {
    title: 'Any Task Execution',
    description:
      'Use AIConsole to automate your work, be it managing your schedule or sending emails.',
    btnText:
      'Tell me more about how AIConsole executes tasks? what kind of tasks can be executed? what is the spectrum of knowledge AIConsole has access to?',
  },
];

export const Welcome = () => {
  const submitCommand = useAICStore((state) => state.submitCommand);

  return (
    <div className="flex flex-col items-center justify-center">
      <section className="container mx-auto px-6 py-8">
        <img
          src="favicon.svg"
          className="filter opacity-75 shadows-lg w-20 h-20 mx-auto m-4"
          alt="Logo"
        />
        <h2 className="text-4xl mb-4 text-center font-extrabold">
          Welcome to <span className=" text-primary">AIConsole!</span>
        </h2>
        <p className="text-xl mb-12  text-center">
          The platform to build your AI universe.
        </p>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {keyAspects.map((aspect, index) => (
            <div
              key={index}
              onClick={() => submitCommand(aspect.btnText)}
              className="bg-black/20 text-left p-4 rounded-lg flex flex-col gap-4 border border-stone-900 shadow-md  hover:text-primary cursor-pointer"
            >
              <h3 className="text-lg font-semibold">{aspect.title}</h3>
              <p className="flex-grow  leading-[24px]">{aspect.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
