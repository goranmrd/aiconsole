import { useSettingsStore } from '@/store/settings/useSettingsStore';
import { AICMessage, AICToolCall } from '@/types/editables/chatTypes';
import { ChatWSMessage } from '@/types/editables/chatWebSocketTypes';
import { getLastMessage, getMessage, getToolCall } from '@/utils/editables/chatUtils';
import { useChatStore } from '../../store/editables/chat/useChatStore';

export async function handleChatMessage(data: ChatWSMessage) {
  switch (data.type) {
    case 'UpdateMessageWSMessage':
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

          useChatStore.setState(() => ({
            isExecuteRunning: false,
          }));

          {
            const chat = useChatStore.getState().chat;

            let ranCode = false;

            if (chat && chat.message_groups.length > 0) {
              const lastMessage = getLastMessage(chat).message;

              //run all in this group
              for (const toolCall of lastMessage.tool_calls) {
                if (useSettingsStore.getState().alwaysExecuteCode) {
                  useChatStore.getState().doRun(toolCall.id);
                  ranCode = true;
                }
              }
            }

            if (!ranCode) {
              await useChatStore.getState().doAnalysis();
            }
          }
          break;
        }
      }
      break;
    case 'UpdateToolCallWSMessage':
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
          break;
      }
      break;
    case 'UpdateToolCallOutputWSMessage':
      switch (data.stage) {
        case 'start':
          useChatStore.getState().editToolCall((toolCall: AICToolCall) => {
            toolCall.output = '';
            toolCall.is_code_executing = true;
          }, data.id);

          useChatStore.setState(() => ({
            isExecuteRunning: true,
          }));
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

          useChatStore.setState(() => ({
            isExecuteRunning: false,
          }));

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
      break;
    case 'UpdateAnalysisWSMessage':
      switch (data.stage) {
        case 'start':
          if (data.analysis_request_id === useChatStore.getState().currentAnalysisRequestId) {
            if (data.agent_id) useChatStore.setState({ agent_id: data.agent_id });
            if (data.relevant_material_ids)
              useChatStore.setState({ relevant_material_ids: data.relevant_material_ids });
            if (data.next_step) useChatStore.setState({ next_step: data.next_step });
            if (data.thinking_process) useChatStore.setState({ thinking_process: data.thinking_process });
          }
          break;
        case 'middle':
          if (data.analysis_request_id === useChatStore.getState().currentAnalysisRequestId) {
            if (data.agent_id) useChatStore.setState({ agent_id: data.agent_id });
            if (data.relevant_material_ids)
              useChatStore.setState({ relevant_material_ids: data.relevant_material_ids });
            if (data.next_step) useChatStore.setState({ next_step: data.next_step });
            if (data.thinking_process) useChatStore.setState({ thinking_process: data.thinking_process });
          }
          break;
        case 'end':
          if (data.analysis_request_id === useChatStore.getState().currentAnalysisRequestId) {
            if (data.agent_id) useChatStore.setState({ agent_id: data.agent_id });
            if (data.relevant_material_ids)
              useChatStore.setState({ relevant_material_ids: data.relevant_material_ids });
            if (data.next_step) useChatStore.setState({ next_step: data.next_step });
            if (data.thinking_process) useChatStore.setState({ thinking_process: data.thinking_process });
          }

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

      break;
    case 'ResetMessageWSMessage':
      useChatStore.getState().editMessage((message: AICMessage) => {
        message.content = '';
      }, data.id);
      break;
    default:
      console.error('Unknown message type: ', data);
  }
}
