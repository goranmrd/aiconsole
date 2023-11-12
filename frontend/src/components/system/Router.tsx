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
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Home } from '../home/Home';
import SideBar from '../sidebar/SideBar';
import { TopBar } from './TopBar';
import { EditableObjectEditor } from './EditableObjectEditor';
import { GlobalSettingsModal } from '../settings/GlobalSettingsModal';

function MustHaveProject() {
  const isProjectOpen = useAICStore((state) => state.isProjectOpen);
  const isProjectLoading = useAICStore((state) => state.isProjectLoading);

  if (!isProjectOpen && !isProjectLoading) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

function NoProject() {
  const isProjectOpen = useAICStore((state) => state.isProjectOpen);
  const isProjectLoading = useAICStore((state) => state.isProjectLoading);

  if (isProjectOpen && !isProjectLoading) {
    return <Navigate to={`/chats/${uuid()}`} />;
  }

  return <Outlet />;
}

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<NoProject />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/" element={<MustHaveProject />}>
          <Route
            path="*"
            element={
              <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400">
                <GlobalSettingsModal />
                <TopBar />
                <div className="flex flex-row h-full overflow-y-auto">
                  <Routes>
                    <Route path="/agents/*" element={<SideBar initialTab="agents" />} />
                    <Route path="/materials/*" element={<SideBar initialTab="materials" />} />
                    <Route path="/chats/*" element={<SideBar initialTab="chats" />} />
                  </Routes>
                  <Routes>
                    <Route path="/:type/:id" element={<EditableObjectEditor />} />
                  </Routes>
                </div>
              </div>
            }
          />
        </Route>
        <Route path="*" element={<div> HEELLO</div>} />
      </Routes>
    </HashRouter>
  );
}
