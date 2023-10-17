export type SetChatIdWSMessage = {
  type: 'SetChatIdWSMessage';
  chat_id: string;
};

export type OutgoingWSMessage = SetChatIdWSMessage;
