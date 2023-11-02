import { createHashRouter, RouterProvider } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { ErrorPage } from '@/components/system/ErrorPage';
import { ChatPage } from '@/components/chat/ChatPage';
import { MaterialPage } from '@/components/materials/MaterialPage';
import { MaterialsPage } from '@/components/materials/MaterialsPage';
import { useAICStore } from '@/store/AICStore';
import { useEffect, useRef } from 'react';
import { RecentProjects } from './components/recentProjects/RecentProjects';

const router = createHashRouter([
  {
    path: '/materials/:material_id',
    element: <MaterialPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/materials',
    element: <MaterialsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: <RecentProjects />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/chats/:chat_id',
    element: <ChatPage />,
    errorElement: <ErrorPage />,
  },
]);

export function Router() {
  const projectPath = useAICStore((state) => state.projectPath);

  const pathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathRef.current) {
      pathRef.current = projectPath;
    }

    if (pathRef.current !== projectPath) {
      router.navigate(`/chats/${uuidv4()}`);
      pathRef.current = projectPath;
    }
  }, [projectPath]);

  return <RouterProvider router={router} />;
}
