import { AICMessage } from '@/types/editables/chatTypes';
import { ResetMessageWSMessage } from '@/types/editables/chatWebSocketTypes';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleResetMessageWSMessage(data: ResetMessageWSMessage) {
  useChatStore.getState().editMessage((message: AICMessage) => {
    message.content = '';
  }, data.id);
}
