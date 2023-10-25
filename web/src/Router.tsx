import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { ErrorPage } from '@/components/system/ErrorPage.tsx';
import { ChatPage } from '@/components/chat/ChatPage.tsx';
import { MaterialPage } from '@/components/materials/MaterialPage.tsx';
import { MaterialsPage } from '@/components/materials/MaterialsPage.tsx';
import { useAICStore } from '@/store/AICStore';
import { useEffect } from 'react';

const router = createBrowserRouter([
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
    element: <ChatPage />,
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

  useEffect(() => {
    router.navigate(`/chats/${uuidv4()}`);
  }, [projectPath]);

  return <RouterProvider router={router} />;
}
