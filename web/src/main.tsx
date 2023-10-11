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

const router = createBrowserRouter([
  {
    path: '/materials/:material_id',
    element: <MaterialView/>,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: <App/>,
    errorElement: <ErrorPage />,
  },
  {
    path: '/chats/:chat_id',
    element: <App/>,
    errorElement: <ErrorPage />,
  },
  
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

useAICStore.getState().initCommandHistory();
useAICStore.getState().initChatHistory();
useAICStore.getState().initAgents();
