import { useSettingsStore } from '@/store/settings/useSettingsStore';
import { AICToolCall } from '@/types/editables/chatTypes';
import { UpdateToolCallWSMessage } from '@/types/editables/chatWebSocketTypes';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleUpdateToolCallWSMessage(data: UpdateToolCallWSMessage) {
  if (useChatStore.getState().isOngoing(data.request_id)) {
    if (data.stage === 'start') {
      useChatStore.getState().appendToolCall({
        id: data.id,
        language: 'python',
        is_code_executing: false,
        code: '',
        headline: '',
        is_streaming: true,
      });
    }

    useChatStore.getState().editToolCall((message: AICToolCall) => {
      if (!message.is_streaming) {
        throw new Error('Received code delta for tool call that is not streaming');
      }

      if (data.code_delta) message.code += data.code_delta;
      if (data.headline_delta) message.headline += data.headline_delta;
      if (data.language) message.language = data.language;

      if (data.stage === 'end') {
        message.is_streaming = false;
      }
    }, data.id);

    if (data.stage === 'end' && useSettingsStore.getState().alwaysExecuteCode) {
      useChatStore.getState().doRun(data.id);
    }
  } else {
    console.warn(`Received code delta for tool call ${data.id} that is not ongoing`);
  }
}
