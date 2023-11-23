import { AICMessage } from '@/types/editables/chatTypes';
import { UpdateMessageWSMessage } from '@/types/editables/chatWebSocketTypes';
import { getLastMessage, getMessage } from '@/utils/editables/chatUtils';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export function cleanupUnfinishedMessage(messageId: string) {
  const chat = useChatStore.getState().chat;
  const messageLocation = getMessage(chat, messageId);

  //If the message is still empty, remove it
  if (messageLocation && messageLocation.message.content === '' && messageLocation.message.tool_calls.length === 0) {
    useChatStore.getState().removeMessageFromGroup(messageLocation.message.id);
  } else {
    useChatStore.getState().editMessage((message) => {
      message.is_streaming = false;

      for (const toolCall of message.tool_calls) {
        toolCall.is_streaming = false;
      }
    }, messageId);
  }
}

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
      cleanupUnfinishedMessage(data.id);

      await useChatStore.getState().saveCurrentChatHistory();

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
