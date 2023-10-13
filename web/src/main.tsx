import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { useAICStore } from './store/AICStore.ts';

import ErrorPage from './components/ErrorPage.tsx';
import App from './components/App.tsx';
import { MaterialView } from './components/MaterialView.tsx';
import MaterialsView from './components/MaterialsView.tsx';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const router = createBrowserRouter([
  {
    path: '/materials/:material_id',
    element: <MaterialView />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/materials',
    element: <MaterialsView />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/chats/:chat_id',
    element: <App />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications position="top-right" />
      <RouterProvider router={router} />
    </MantineProvider>
  </React.StrictMode>,
);

useAICStore.getState().initCommandHistory();
useAICStore.getState().initCurrentProject();
