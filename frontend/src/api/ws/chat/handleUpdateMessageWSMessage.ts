import { AICMessage } from '@/types/editables/chatTypes';
import { UpdateMessageWSMessage } from '@/types/editables/chatWebSocketTypes';
import { getLastMessage } from '@/utils/editables/chatUtils';
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
    }

    if (data.text_delta) {
      useChatStore.getState().editMessage((message: AICMessage) => {
        if (!message.is_streaming) {
          throw new Error('Received text delta for message that is not streaming');
        }

        message.content += data.text_delta;
      }, data.id);
    }

    if (data.stage === 'end') {
      useChatStore.getState().finishProcess(data.request_id, false);

      const chat = useChatStore.getState().chat;
      const ranCode = chat && chat.message_groups.length > 0 && getLastMessage(chat)?.message.tool_calls.length !== 0;

      if (!ranCode) {
        await useChatStore.getState().doAnalysis();
      }
    }
  } else {
    console.warn(`Received text delta for message ${data.id} that is not ongoing`);
  }
}
