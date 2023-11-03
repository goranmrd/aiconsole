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

import { TopBar } from '@/components/top/TopBar';
import { ProjectCard } from './ProjectCard';
import { RecentProjectsEmpty } from './RecentProjectsEmpty';

// TODO: temporary mocked data until backend is ready
const MOCKED_PROJECTS_DATA = [
  {
    id: 1,
    name: 'Project 1',

    chatHistory: [
      'Lorem ipsum dolor amet',
      'Lorem ipsum dolor sit amet, consectetur',
      'Dolor sit amet, consectetur adipiscing elit',
      'In vitae nunc eget. Aspernatur vitae',
    ],
  },
  {
    id: 2,
    name: 'Project 2',

    chatHistory: [
      'Lorem ipsum dolor amet',
      'Lorem ipsum dolor sit amet, consectetur',
      'Dolor sit amet, consectetur adipiscing elit',
      'In vitae nunc eget. Aspernatur vitae',
    ],
  },
  {
    id: 3,
    name: 'Project 3',

    chatHistory: [
      'Lorem ipsum dolor amet',
      'Lorem ipsum dolor sit amet, consectetur',
      'Dolor sit amet, consectetur adipiscing elit',
      'In vitae nunc eget. Aspernatur vitae',
    ],
  },
  {
    id: 4,
    name: 'Project 4',

    chatHistory: [
      'Lorem ipsum dolor amet',
      'Lorem ipsum dolor sit amet, consectetur',
      'Dolor sit amet, consectetur adipiscing elit',
      'In vitae nunc eget. Aspernatur vitae',
    ],
  },
  {
    id: 5,
    name: 'Project 5',

    chatHistory: [
      'Lorem ipsum dolor amet',
      'Lorem ipsum dolor sit amet, consectetur',
      'Dolor sit amet, consectetur adipiscing elit',
      'In vitae nunc eget. Aspernatur vitae',
    ],
  },
  {
    id: 6,
    name: 'Project 6',

    chatHistory: [
      'Lorem ipsum dolor amet',
      'Lorem ipsum dolor sit amet, consectetur',
      'Dolor sit amet, consectetur adipiscing elit',
      'In vitae nunc eget. Aspernatur vitae',
    ],
  },
];

export function RecentProjects() {
  return (
    <div className="min-h-[100vh] bg-recent-bg bg-cover bg-top">
      {!MOCKED_PROJECTS_DATA.length ? (
        <div>
          <TopBar variant="recentProjects" />

          <div className="px-[60px] py-[40px]">
            <img src="favicon.svg" className="shadows-lg w-[60px] h-[60px] mx-auto m-4" alt="Logo" />
            <h1 className="text-[56px] mb-[60px] text-center font-black text-white ">
              Welcome to <span className=" text-primary">AIConsole!</span>
            </h1>
            <div className="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(355px,_435px))] justify-center gap-[20px] mx-auto ">
              {MOCKED_PROJECTS_DATA.map(({ id, name, chatHistory }) => (
                <ProjectCard key={id} id={id} name={name} chatHistory={chatHistory} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <RecentProjectsEmpty />
      )}
    </div>
  );
}
