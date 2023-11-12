import { MaterialPage } from '@/components/assets/MaterialPage';
import { useAICStore } from '@/store/AICStore';
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { AgentPage } from '../assets/AgentPage';
import { ChatPage } from '../chat/ChatPage';
import { Home } from '../home/Home';
import { TopBar } from './TopBar';
import SideBar from './sidebar/SideBar';

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
        <Route path="*" element={<div> HEELLO</div>} />
      </Routes>
    </HashRouter>
  );
}
