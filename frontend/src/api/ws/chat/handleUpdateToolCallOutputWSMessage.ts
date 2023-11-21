import { AICToolCall } from '@/types/editables/chatTypes';
import { UpdateToolCallOutputWSMessage } from '@/types/editables/chatWebSocketTypes';
import { getToolCall } from '@/utils/editables/chatUtils';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleUpdateToolCallOutputWSMessage(data: UpdateToolCallOutputWSMessage) {
  switch (data.stage) {
    case 'start':
      //is_code_executing was set in doRun
      break;
    case 'middle':
      useChatStore.getState().editToolCall((toolCall: AICToolCall) => {
        if (data.output_delta) toolCall.output += data.output_delta;
      }, data.id);
      break;
    case 'end': {
      useChatStore.getState().editToolCall((toolCall: AICToolCall) => {
        if (data.output_delta) toolCall.output += data.output_delta;
        toolCall.is_code_executing = false;
      }, data.id);

      useChatStore.getState().saveCurrentChatHistory();
      const chat = useChatStore.getState().chat;

      if (!chat) {
        throw new Error('Chat is not initialized');
      }

      //if all code in the current message is ran, continue operation with the same agent
      const toolCallLocation = getToolCall(chat, data.id);

      if (!toolCallLocation) {
        throw new Error('Tool call not found');
      }

      const message = toolCallLocation.message;

      // if all tools have finished running, continue operation with the same agent
      const finishedRunnigCode = message.tool_calls.every(
        (toolCall) => toolCall.is_code_executing === false && toolCall.output,
      );

      if (finishedRunnigCode) {
        await useChatStore.getState().doExecute();
      }

      break;
    }
  }
}
