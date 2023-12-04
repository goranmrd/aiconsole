import { AICMessage } from '@/types/editables/chatTypes';
import { UpdateMessageWSMessage } from '@/types/editables/chatWebSocketTypes';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleUpdateMessageWSMessage(data: UpdateMessageWSMessage) {
  if (useChatStore.getState().isOngoing(data.request_id)) {
    if (data.stage === 'start') {
      useChatStore.getState().appendMessage({
        id: data.id,
        content: data.text_delta || '',
        tool_calls: [],
        is_streaming: true,
      });
    } else {
      if (data.text_delta) {
        useChatStore.getState().editMessage((message: AICMessage) => {
          if (!message.is_streaming) {
            throw new Error('Received text delta for message that is not streaming');
          }

          message.content += data.text_delta;

          if (data.stage === 'end') {
            message.is_streaming = false;
          }
        }, data.id);
      }
    }
  } else {
    console.warn(`Received text delta for message ${data.id} that is not ongoing`);
  }
}
