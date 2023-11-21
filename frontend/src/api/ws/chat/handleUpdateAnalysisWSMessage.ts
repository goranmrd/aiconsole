import { UpdateAnalysisWSMessage } from '@/types/editables/chatWebSocketTypes';
import { useChatStore } from '../../../store/editables/chat/useChatStore';

export async function handleUpdateAnalysisWSMessage(data: UpdateAnalysisWSMessage) {
  if (data.analysis_request_id === useChatStore.getState().currentAnalysisRequestId) {
    if (data.agent_id) useChatStore.setState({ agent_id: data.agent_id });
    if (data.relevant_material_ids) useChatStore.setState({ relevant_material_ids: data.relevant_material_ids });
    if (data.next_step) useChatStore.setState({ next_step: data.next_step });
    if (data.thinking_process) useChatStore.setState({ thinking_process: data.thinking_process });
  }

  switch (data.stage) {
    case 'start':
      break;
    case 'middle':
      break;
    case 'end':
      if (useChatStore.getState().agent_id !== 'user' && useChatStore.getState().next_step) {
        useChatStore.getState().appendGroup({
          agent_id: useChatStore.getState().agent_id || '',
          task: useChatStore.getState().next_step || '',
          materials_ids: useChatStore.getState().relevant_material_ids || [],
          role: 'assistant',
          messages: [],
        });

        useChatStore.getState().doExecute();
      }

      if (useChatStore.getState().currentAnalysisRequestId === data.analysis_request_id) {
        useChatStore.setState(() => ({
          currentAnalysisRequestId: undefined,
          agent_id: undefined,
          relevant_material_ids: undefined,
          next_step: undefined,
          thinking_process: undefined,
        }));
      }
      break;
  }
}
