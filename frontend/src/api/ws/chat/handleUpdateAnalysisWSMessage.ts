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
  } else {
    console.warn(`Received analysis update for request id ${data.request_id} that is not ongoing`);
  }
}
