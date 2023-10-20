export type AICMessage = {
  agent_id: string;
  id: string;
  role: string;
  task?: string;
  content: string;
  timestamp: string;
  materials_ids: string[];
  language?: string;
  code?: boolean;
  code_ran?: boolean;
  code_output?: boolean;
};

export type AICMessageSection = {
  id: string;
  foldable: boolean;
  messages: AICMessage[];
};

export type AICMessageGroup = {
  id: string;
  agent_id: string;
  role: string;
  task: string;
  materials_ids: string[];
  sections: AICMessageSection[];
};

export type MaterialDefinedIn = 'aiconsole' | 'project';
export const materialDefinedInOptions: MaterialDefinedIn[] = [
  'aiconsole',
  'project',
];
export type MaterialStatus = 'disabled' | 'enabled' | 'forced';
export const materialStatusOptions: MaterialStatus[] = [
  'disabled',
  'enabled',
  'forced',
];
export type MaterialContentType = 'static_text' | 'dynamic_text' | 'api';
export const materialContenTypeOptions: MaterialContentType[] = [
  'static_text',
  'dynamic_text',
  'api',
];

export type Material = {
  id: string;
  name: string;
  usage: string;
  defined_in: MaterialDefinedIn;
  status: MaterialStatus;
  content_type: MaterialContentType;
  content_static_text: string;
  content_dynamic_text: string;
  content_api: string;
};

export type RenderedMaterial = {
  id: string;
  content: string;
  error: string;
};

export type MaterialInfo = {
  id: string;
  usage: string;
};

export type ChatHeadline = {
  id: string;
  message: string;
  timestamp: string;
};

export type Chat = {
  id: string;
  auto_run: boolean;
  messages: AICMessage[];
};

export type Agent = {
  id: string;
  name: string;
  usage: string;
  system: string;
};
