import { Navigate, useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Chat } from './Chat';
import { CommandInput } from './CommandInput';

export function ChatPage() {
  const params = useParams();

  if (!params.chatId) {
    return <Navigate to={`/chats/${uuid()}`} />;
  }

  return (
    <div className="flex w-full flex-col justify-between downlight">
      <Chat chatId={params.chatId} />
      <CommandInput className="flex-none" />
    </div>
  );
}
