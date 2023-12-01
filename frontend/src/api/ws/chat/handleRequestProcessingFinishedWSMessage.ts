import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useSettingsStore } from '@/store/settings/useSettingsStore';
import { RequestProcessingFinishedWSMessage } from '@/types/editables/chatWebSocketTypes';
import { getLastMessage } from '@/utils/editables/chatUtils';

export async function handleRequestProcessingFinishedWSMessage(data: RequestProcessingFinishedWSMessage) {
  if (data.aborted) {
    useChatStore.getState().finishProcess(data.request_id, true);
    return;
  }

  if (useChatStore.getState().analysis.agent_id) {
    //if analysis ended
    if (useChatStore.getState().analysis.agent_id !== 'user' && useChatStore.getState().analysis.next_step) {
      useChatStore.getState().appendGroup({
        agent_id: useChatStore.getState().analysis.agent_id || '',
        task: useChatStore.getState().analysis.next_step || '',
        materials_ids: useChatStore.getState().analysis.relevant_material_ids || [],
        role: 'assistant',
        messages: [],
      });

      useChatStore.getState().finishProcess(data.request_id, false);
      useChatStore.getState().doExecute();
    } else {
      useChatStore.getState().finishProcess(data.request_id, false);
    }
  } else {
    // execute ended
    useChatStore.getState().finishProcess(data.request_id, false);

    const lastMessage = getLastMessage(useChatStore.getState().chat);
    let hasCodeToRun = false;
    if (lastMessage) {
      for (const toolCall of lastMessage.message.tool_calls) {
        if (useSettingsStore.getState().alwaysExecuteCode) {
          await useChatStore.getState().doRun(toolCall.id);
        }
        hasCodeToRun = true;
      }
    }

    if (!hasCodeToRun) {
      await useChatStore.getState().doAnalysis();
    }

    if (data.request_id) {
      console.log('Received request processing finished message for request id: ', data.request_id);
    } else {
      console.error('Received request processing finished message without request id');
    }
  }
}
