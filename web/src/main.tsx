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

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { initStore } from './store/AICStore.ts';
import { ErrorPage } from '@/components/system/ErrorPage.tsx';
import { ChatPage } from '@/components/chat/ChatPage.tsx';
import { MaterialPage } from '@/components/materials/MaterialPage.tsx';
import { MaterialsPage } from '@/components/materials/MaterialsPage.tsx';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { SocketInitiator } from '@/components/system/SocketInitiator.tsx';

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

initStore();
