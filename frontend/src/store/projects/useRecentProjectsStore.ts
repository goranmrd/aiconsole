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

import { create } from 'zustand';

import { RecentProject } from '@/types/projects/RecentProject';
import { ProjectsAPI } from '../../api/api/ProjectsAPI';
import { useProjectStore } from './useProjectStore';

export type RecentProjectsStore = {
  initRecentProjects: () => Promise<void>;
  recentProjects: RecentProject[];
  removeRecentProject: (projectPath: string) => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useRecentProjectsStore = create<RecentProjectsStore>((set, _) => ({
  initRecentProjects: async () => {
    useProjectStore.subscribe(async (state, prevState) => {
      // every time the project path changes, let's update the recent project list
      if (prevState.projectPath !== state.projectPath) {
        const recentProjects = await ProjectsAPI.getRecentProjects();
        set({ recentProjects });
      }
    });
  },
  removeRecentProject: async (projectPath: string) => {
    await ProjectsAPI.removeRecentProject(projectPath);
    const recentProjects = await ProjectsAPI.getRecentProjects();
    set({ recentProjects });
  },
  recentProjects: [],
}));
