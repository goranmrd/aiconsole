import { ChatWSMessage } from '@/types/editables/chatWebSocketTypes';
import { handleUpdateToolCallWSMessage } from './handleUpdateToolCallWSMessage';
import { handleUpdateMessageWSMessage } from './handleUpdateMessageWSMessage';
import { handleUpdateToolCallOutputWSMessage } from './handleUpdateToolCallOutputWSMessage';
import { handleUpdateAnalysisWSMessage } from './handleUpdateAnalysisWSMessage';
import { handleResetMessageWSMessage } from './handleResetMessageWSMessage';

export async function handleChatMessage(data: ChatWSMessage) {
  switch (data.type) {
    case 'UpdateMessageWSMessage':
      await handleUpdateMessageWSMessage(data);
      break;
    case 'UpdateToolCallWSMessage':
      await handleUpdateToolCallWSMessage(data);
      break;
    case 'UpdateToolCallOutputWSMessage':
      await handleUpdateToolCallOutputWSMessage(data);
      break;
    case 'UpdateAnalysisWSMessage':
      await handleUpdateAnalysisWSMessage(data);
      break;
    case 'ResetMessageWSMessage':
      await handleResetMessageWSMessage(data);
      break;
    default:
      console.error('Unknown message type: ', data);
  }
}
