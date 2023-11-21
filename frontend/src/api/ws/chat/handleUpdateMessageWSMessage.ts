import { AICMessage } from '@/types/editables/chatTypes';
import { UpdateMessageWSMessage } from '@/types/editables/chatWebSocketTypes';
import { getLastMessage, getMessage } from '@/utils/editables/chatUtils';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleUpdateMessageWSMessage(data: UpdateMessageWSMessage) {
  switch (data.stage) {
    case 'start':
      useChatStore.getState().appendMessage({
        id: data.id,
        content: data.text_delta || '',
        tool_calls: [],
        is_streaming: true,
      });
      break;
    case 'middle':
      useChatStore.getState().editMessage((message: AICMessage) => {
        if (data.text_delta) message.content += data.text_delta;
      }, data.id);
      break;
    case 'end': {
      useChatStore.getState().editMessage((message: AICMessage) => {
        if (data.text_delta) message.content += data.text_delta;
        message.is_streaming = false;
      }, data.id);

      const chat = useChatStore.getState().chat;

      if (!chat) {
        throw new Error('Chat is not initialized');
      }

      const messageLocation = getMessage(chat, data.id);

      //If the message is still empty, remove it
      if (
        messageLocation &&
        messageLocation.message.content === '' &&
        messageLocation.message.tool_calls.length === 0
      ) {
        useChatStore.getState().removeMessageFromGroup(messageLocation.message.id);
      }

      //TODO: Should this be in above if?
      await useChatStore.getState().saveCurrentChatHistory();

      {
        const chat = useChatStore.getState().chat;

        let ranCode = false;

        if (chat && chat.message_groups.length > 0) {
          ranCode = getLastMessage(chat)?.message.tool_calls.length !== 0;
        }

        if (!ranCode) {
          await useChatStore.getState().doAnalysis();
        }
      }
      break;
    }
  }
}
