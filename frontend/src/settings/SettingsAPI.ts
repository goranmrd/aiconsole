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


import { Settings } from "@/settings/Settings";
import { API_HOOKS, getBaseURL } from '../common/useAPIStore';
import ky from 'ky';


const checkKey = (key: string) => {
  return ky.post(`${getBaseURL()}/api/check_key`, {
    json: { key },
    hooks: API_HOOKS,
  });
};

async function saveSettings(params: { to_global: boolean } & Settings) {
  return ky.patch(`${getBaseURL()}/api/settings`, { json: params, hooks: API_HOOKS });
}

async function getSettings(): Promise<Settings> {
  return ky.get(`${getBaseURL()}/api/settings`, { hooks: API_HOOKS, timeout: 60000 }).json();
}

export const SettingsAPI = {
  saveSettings,
  getSettings,
  checkKey,
};
