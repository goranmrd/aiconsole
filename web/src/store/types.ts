export type AICMessage = {
  agent_id: string;
  id: string;
  role: string;
  task?: string;
  content: string;
  timestamp: string;
  materials: Material[];
  language?: string;
  code?: boolean;
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
  materials: Material[];
  sections: AICMessageSection[];
};

export type Material = {
  id: string;
  usage: string;
  defined_in: "core" | "project";
  status: "disabled" | "enabled" | "forced";
  python_module?: string;
  python_code?: string;
  content_type: "static" | "python";
  content_source: string;
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
  messages: AICMessage[];
  timestamp: string;
};

export type Agent = {
  id: string;
  name: string;
  usage: string;
  system: string;
};
