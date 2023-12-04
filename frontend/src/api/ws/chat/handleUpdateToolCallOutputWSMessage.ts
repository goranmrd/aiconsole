import { AICToolCall } from '@/types/editables/chatTypes';
import { UpdateToolCallOutputWSMessage } from '@/types/editables/chatWebSocketTypes';
import { getLastMessage, getToolCall } from '@/utils/editables/chatUtils';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleUpdateToolCallOutputWSMessage(data: UpdateToolCallOutputWSMessage) {
  if (useChatStore.getState().isOngoing(data.request_id)) {
    if (data.stage === 'start') {
      useChatStore.getState().editToolCall((toolCall: AICToolCall) => {
        toolCall.is_code_executing = true;
        toolCall.output = '';
      }, data.id);
    }

    useChatStore.getState().editToolCall((toolCall: AICToolCall) => {
      if (!toolCall.is_code_executing) {
        throw new Error('Received output for tool call that is not executing');
      }

      if (data.output_delta) toolCall.output += data.output_delta;
    }, data.id);

    if (data.stage === 'end') {
      useChatStore.getState().editToolCall((toolCall) => {
        toolCall.is_code_executing = false;
      }, data.id);

      useChatStore.getState().finishProcess(data.request_id, false);
      const chat = useChatStore.getState().chat;

      //if all code in the current message is ran, continue operation with the same agent
      const toolCallLocation = getToolCall(chat, data.id);
      const lastMessage = getLastMessage(chat);

      const message = toolCallLocation?.message;

      if (message?.id === lastMessage?.message.id) {
        // if all tools have finished running, continue operation with the same agent
        const finishedRunnigCode = message?.tool_calls.every(
          (toolCall) => toolCall.is_code_executing === false && toolCall.output !== undefined,
        );

        if (finishedRunnigCode) {
          await useChatStore.getState().doExecute(); // Resume operation with the same agent
        }
      }
    }
  } else {
    console.warn(`Received output for tool call ${data.id} that is not ongoing`);
  }
}
