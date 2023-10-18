export type ErrorWSMessage = {
  type: 'ErrorWSMessage';
  error: string;
};

export type NotificationWSMessage = {
  type: 'NotificationWSMessage';
  title: string;
  message: string;
};

export type DebugJSONWSMessage = {
  type: 'DebugJSONWSMessage';
  message: string;
  object: object;
};

export type ProjectOpenedWSMessage = {
  type: 'ProjectOpenedWSMessage';
  name: string;
  path: string;
};

export type AnalysisUpdatedWSMessage = {
  type: 'AnalysisUpdatedWSMessage';
  agent_id?: string;
  relevant_material_ids?: string[];
  next_step?: string;
  thinking_process?: string;
};

export type IncomingWSMessage =
  | ErrorWSMessage
  | NotificationWSMessage
  | DebugJSONWSMessage
  | ProjectOpenedWSMessage
  | AnalysisUpdatedWSMessage
