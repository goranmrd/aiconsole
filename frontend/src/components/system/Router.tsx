import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { MaterialPage } from '@/components/materials/MaterialPage';
import { Home } from '../home/Home';
import { v4 as uuid } from 'uuid';
import { useAICStore } from '@/store/AICStore';
import { FullScreenSpinner } from './FullScreenSpinner';
import { TopBar } from './TopBar';
import SideBar from './sidebar/SideBar';
import { AgentPage } from '../agent/AgentPage';
import { ChatPage } from '../chat/ChatPage';

function MustHaveProject() {
  const isProjectOpen = useAICStore((state) => state.isProjectOpen);

  if (!isProjectOpen) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

function NoProject() {
  const isProjectOpen = useAICStore((state) => state.isProjectOpen);

  if (isProjectOpen) {
    return <Navigate to={`/chats/${uuid()}`} />;
  }

  return <Outlet />;
}

function LoadingProject() {
  const isProjectLoading = useAICStore((state) => state.isProjectLoading);

  if (!isProjectLoading) {
    return <Navigate to="/" />;
  }

  return <FullScreenSpinner />;
}

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/loading" element={<LoadingProject />} />
        <Route path="/" element={<NoProject />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/" element={<MustHaveProject />}>
          <Route
            path="*"
            element={
              <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400">
                <TopBar />
                <div className="flex flex-row h-full overflow-y-auto">
                  <Routes>
                    <Route path="/agents/*" element={<SideBar initialTab="agents" />} />
                    <Route path="/materials/*" element={<SideBar initialTab="materials" />} />
                    <Route path="/chats/*" element={<SideBar initialTab="chats" />} />
                  </Routes>
                  <Routes>
                    <Route path="/agents/:agentId" element={<AgentPage />} />
                    <Route path="/materials/:materialId" element={<MaterialPage />} />
                    <Route path="/chats/:chatId" element={<ChatPage />} />
                  </Routes>
                </div>
              </div>
            }
          />
        </Route>
        
      </Routes>
    </HashRouter>
  );
}
