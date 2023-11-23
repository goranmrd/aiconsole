import { UpdateAnalysisWSMessage } from '@/types/editables/chatWebSocketTypes';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleUpdateAnalysisWSMessage(data: UpdateAnalysisWSMessage) {
  if (useChatStore.getState().isOngoing(data.request_id)) {
    useChatStore.setState({
      analysis: {
        ...useChatStore.getState().analysis,
        ...(data.agent_id && { agent_id: data.agent_id }),
        ...(data.relevant_material_ids && { relevant_material_ids: data.relevant_material_ids }),
        ...(data.next_step && { next_step: data.next_step }),
        ...(data.thinking_process && { thinking_process: data.thinking_process }),
      },
    });

    if (data.stage === 'end') {
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
    }
  } else {
    console.warn(`Received analysis update for request id ${data.request_id} that is not ongoing`);
  }
}
