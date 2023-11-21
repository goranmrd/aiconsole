import { useSettingsStore } from '@/store/settings/useSettingsStore';
import { AICToolCall } from '@/types/editables/chatTypes';
import { UpdateToolCallWSMessage } from '@/types/editables/chatWebSocketTypes';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleUpdateToolCallWSMessage(data: UpdateToolCallWSMessage) {
  switch (data.stage) {
    case 'start':
      useChatStore.getState().appendToolCall({
        id: data.id,
        language: 'python',
        is_code_executing: false,
        code: '',
        headline: '',
        is_streaming: true,
      });
      break;
    case 'middle':
      useChatStore.getState().editToolCall((message: AICToolCall) => {
        if (data.code_delta) message.code += data.code_delta;
        if (data.headline_delta) message.headline += data.headline_delta;
        if (data.language) message.language = data.language;
      }, data.id);
      break;
    case 'end':
      useChatStore.getState().editToolCall((message: AICToolCall) => {
        if (data.code_delta) message.code += data.code_delta;
        if (data.headline_delta) message.headline += data.headline_delta;
        if (data.language) message.language = data.language;
        message.is_streaming = false;
      }, data.id);

      if (useSettingsStore.getState().alwaysExecuteCode) {
        useChatStore.getState().doRun(data.id);
      }

      break;
  }
}
