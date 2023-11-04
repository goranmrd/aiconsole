import { HashRouter, Route, Routes } from 'react-router-dom';
import { ErrorPage } from '@/components/system/ErrorPage';
import { ChatPage } from '@/components/chat/ChatPage';
import { MaterialPage } from '@/components/materials/MaterialPage';
import { MaterialsPage } from '@/components/materials/MaterialsPage';
import { Home } from '../home/Home';
import { RouteMonitor } from './RouteMonitor';

export function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/materials/:material_id" element={<RouteMonitor><MaterialPage /></RouteMonitor>} errorElement={<ErrorPage />} />
        <Route path="/materials" element={<RouteMonitor><MaterialsPage /></RouteMonitor>} errorElement={<ErrorPage />} />
        <Route path="/" element={<RouteMonitor><Home /></RouteMonitor>} errorElement={<ErrorPage />} />
        <Route path="/chats/:chat_id" element={<RouteMonitor><ChatPage/></RouteMonitor>} errorElement={<ErrorPage />} />
      </Routes>
    </HashRouter>
  );
}
