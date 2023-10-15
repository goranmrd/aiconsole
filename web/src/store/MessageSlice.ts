import { StateCreator } from 'zustand';
import { Chat, AICMessage, AICMessageGroup } from './types';
import { AICStore } from './AICStore';

export type MessageSlice = {
  messages: AICMessage[];
  setMessages: (chat: Chat) => void;
  removeMessage: (id: string) => void;
  editMessageContent: (id: string, content: string) => void;
  groupedMessages: () => AICMessageGroup[];
};

export const createMessageSlice: StateCreator<
  AICStore,
  [],
  [],
  MessageSlice
> = (set, get) => ({
  messages: [],
  setMessages: (chat: Chat) => {
    set(() => ({
      messages: [...chat.messages],
    }))
  },
  removeMessage: (id: string) => {
    set((state) => ({
      messages: (state.messages || []).filter((message) => message.id !== id),
    }))
    get().saveCurrentChatHistory()
  },
    
  editMessageContent: (id: string, content: string) => {
    const isUserMessage = get().messages?.find((message) => message.id === id)?.role === 'user'

    set((state) => ({
      messages: (state.messages || []).map((message) =>
        message.id === id ? { ...message, content } : message,
      ),
    }))

    get().saveCommandAndMessagesToHistory(content, isUserMessage)
  },
  groupedMessages: () => {
    const groups: AICMessageGroup[] = [];

    //Group messages 
    for (const message of get().messages || []) {
      if (
        groups.length === 0 ||
        groups[groups.length - 1].role !== message.role ||
        groups[groups.length - 1].agent_id !== message.agent_id ||
        groups[groups.length - 1].task !== message.task ||
        groups[groups.length - 1].materials_ids.join('|') !==
          message.materials_ids.join('|')
      ) {
        groups.push({
          id: message.id,
          agent_id: message.agent_id,
          role: message.role,
          task: message.task || '',
          materials_ids: message.materials_ids,
          sections: [{ id: message.id, foldable: false, messages: [message] }],
        });
      } else {
        groups[groups.length - 1].sections.push({
          id: message.id,
          foldable: false,
          messages: [message],
        });
      }
    }

    //Make all code and code_output messages foldable
    for (const group of groups) {
      for (const microGroup of group.sections) {
        if (microGroup.messages[0].code || microGroup.messages[0].code_output) {
          microGroup.foldable = true;
        }
      }
    }

    //Join all microGroups that have foldable messages together
    for (const group of groups) {
      let i = 0;
      while (i < group.sections.length - 1) {
        if (group.sections[i].foldable && group.sections[i + 1].foldable) {
          group.sections[i].messages = [
            ...group.sections[i].messages,
            ...group.sections[i + 1].messages,
          ];
          group.sections.splice(i + 1, 1);
        } else {
          i++;
        }
      }
    }

    return groups;
  },
  
});
