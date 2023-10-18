import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { useAICStore } from './store/AICStore.ts';

import { ErrorPage } from '@/components/pages/ErrorPage.tsx';
import { ChatPage } from '@/components/pages/ChatPage.tsx';
import { MaterialPage } from '@/components/pages/MaterialPage.tsx';
import { MaterialsPage } from '@/components/pages/MaterialsPage.tsx';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { SocketInitiator } from '@/api/messages/SocketInitiator.tsx';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications position="top-right" />
      <SocketInitiator>
        <RouterProvider router={router} />
      </SocketInitiator>
    </MantineProvider>
  </React.StrictMode>,
);

useAICStore.getState().initCommandHistory();
