import { v4 as uuidv4 } from 'uuid';

import { Material, AICMessage } from './types';
import { useAICStore } from './AICStore';
import { useDebouncedValue } from '@mantine/hooks';

export function createMessage({
  agent_id,
  role,
  task,
  content,
  materials,
  language,
  code,
  code_output,
}: {
  agent_id: string;
  role: string;
  task?: string;
  content: string;
  materials: Material[];
  language?: string;
  code?: boolean;
  code_output?: boolean;
}): AICMessage {
  return {
    agent_id,
    id: uuidv4(),
    role,
    task,
    materials,
    content,
    language,
    code,
    code_output,
    timestamp: new Date().toISOString(),
  };
}

export function useDebouncedPrompt() {
  const prompt = useAICStore(
    (state) => state.commandHistory[state.commandIndex],
  ).trim();
  const [debouncedPrompt] = useDebouncedValue(prompt, 150, { leading: true });

  return debouncedPrompt;
}
