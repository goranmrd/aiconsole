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

import ky from 'ky';
import { API_HOOKS, getBaseURL } from '../../store/useAPIStore';
import { RecentProject } from "@/types/projects/RecentProject";

const closeProject = () => ky.post(`${getBaseURL()}/api/projects/close`, { hooks: API_HOOKS });

const chooseProject = (path?: string) =>
  ky.post(`${getBaseURL()}/api/projects/choose`, {
    json: { directory: path },
    hooks: API_HOOKS,
    timeout: false, // infinite timeout
  });

const isProjectDirectory = async (path?: string) =>
  (await ky
    .post(`${getBaseURL()}/api/projects/is_project`, {
      json: { directory: path },
      hooks: API_HOOKS,
      timeout: false,
    })
    .json()) as {
    is_project: boolean;
    path: string;
  };

const getCurrentProject = () => ky.get(`${getBaseURL()}/api/projects/current`, { hooks: API_HOOKS });

async function getRecentProjects(): Promise<RecentProject[]> {
  return ky.get(`${getBaseURL()}/api/projects/recent`, { hooks: API_HOOKS }).json();
}

async function removeRecentProject(path: string) {
  return ky.delete(`${getBaseURL()}/api/projects/recent`, {
    json: { path },
    hooks: API_HOOKS,
  });
}

export const ProjectsAPI = {
  closeProject,
  chooseProject,
  getRecentProjects,
  removeRecentProject,
  isProjectDirectory,
  getCurrentProject,
};
