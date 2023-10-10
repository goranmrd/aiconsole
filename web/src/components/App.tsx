import SideBar from './SideBar';

import { Chat } from './Chat';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const { chat_id } = useParams<{ chat_id: string | undefined }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!chat_id) {
      navigate(`/chats/${uuidv4()}`);
    }
  }, [chat_id, navigate]);

  return (
    <MantineProvider>
      <Notifications position="top-right" />
      
        <div className="App flex fixed top-0 left-0 bottom-0 right-0 bg-gray-800 dark: text-slate-200">
          <SideBar />
          {chat_id && <Chat chatId={chat_id} />}
        </div>
    </MantineProvider>
  );
}

export default App;
