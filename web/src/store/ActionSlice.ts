import { StateCreator } from 'zustand';

import { Agent, Material as Material } from './types';
import { createMessage } from './utils';
import { Api } from '../api/Api';
import { AICStore } from './AICStore';

export type ActionSlice = {
  doAnalysis: () => Promise<void>;
  isAnalysisRunning: boolean;
  doExecute: (
    agentId: string,
    task: string,
    materials: Material[],
  ) => Promise<void>;
  doRun: (
    agentId: string,
    task: string,
    materials: Material[],
    language: string,
    code: string,
  ) => Promise<void>;
  isExecuteRunning: boolean;
  isWorking: () => boolean;
  stopWork: () => void;
  analysisAbortController: AbortController;
  executeAbortSignal: AbortController;
};

export const createActionSlice: StateCreator<AICStore, [], [], ActionSlice> = (
  set,
  get,
) => ({
  isAnalysisRunning: false,

  isExecuteRunning: false,

  analysisTimeoutId: undefined,

  analysisAbortController: new AbortController(), // Initialize fetchAbortController as undefined

  executeAbortSignal: new AbortController(),

  doAnalysis: async () => {
    try {
      set(() => ({
        analysisAbortController: new AbortController(),
        isAnalysisRunning: true,
      }));
      const response = await Api.analyse(
        {
          id: get().chatId,
          messages: get().messages,
        },
        get().analysisAbortController.signal,
      );

      const data = await response.json<{
        agent: Agent;
        materials: Material[];
        used_tokens: number;
        available_tokens: number;
        next_step: string;
      }>();

      if (get().analysisAbortController.signal.aborted) {
        // If existing fetch operation has been aborted, stop proceeding
        return;
      }

      if (data.agent.id !== 'user' && data.next_step) {
        set(() => {
          const newMessages = (get().messages || []).slice();
          //push next step
          newMessages.push(
            createMessage({
              agent_id: data.agent.id,
              task: data.next_step,
              materials: data.materials,
              role: 'assistant',
              content: '',
            }),
          );
          return {
            messages: newMessages,
          };
        });

        if (data.agent.id !== 'user') {
          console.log('Executing');
          get().doExecute(data.agent.id, data.next_step, data.materials);
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Analysis aborted');
        return;
      } else {
        throw err;
      }
    } finally {
      set(() => ({
        isAnalysisRunning: false,
      }));
    }
  },

  doRun: async (
    agentId: string,
    task: string,
    materials: Material[],
    language: string,
    code: string,
  ) => {
    set(() => ({
      executeAbortSignal: new AbortController(),
      isExecuteRunning: true,
    }));

    try {
      const response = await Api.run_code({
        chatId: get().chatId,
        language,
        code,
        signal: get().executeAbortSignal.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      set(({ messages }) => ({
        messages: [
          ...(messages || []),
          createMessage({
            agent_id: agentId,
            task: task,
            materials,
            role: 'assistant',
            content: '',
            code_output: true,
          }),
        ],
      }));

      while (true) {
        try {
          const { value, done } = (await reader?.read()) || {
            value: undefined,
            done: true,
          };

          const messages = get().messages || [];

          const textChunk = decoder.decode(value);

          messages[messages.length - 1].content += textChunk;

          set(() => ({
            messages: messages.slice(),
          }));

          if (done) {
            break;
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            console.log('Execution operation aborted');
            return;
          } else {
            throw err;
          }
        }
      }
    } finally {
      get().saveCurrentChatHistory();

      set(() => ({
        isExecuteRunning: false,
      }));
    }

    // We ran code, continue operation with the same agent
    console.log('from run output: doExecute');

    //Create new message with the same agent, needed for doExecute
    set(() => {
      const newMessages = (get().messages || []).slice();

      newMessages.push(
        createMessage({
          agent_id: agentId,
          task: task,
          materials: materials,
          role: 'assistant',
          content: '',
        }),
      );
      return {
        messages: newMessages,
      };
    });

    await get().doExecute(agentId, task, materials);
  },

  /**
   * doExecute expects that the last message is the one it should be filling in.
   */
  doExecute: async (agentId: string, task: string, materials: Material[]) => {
    const commonMessageAspects = {
      agent_id: agentId,
      task: task,
      materials,
      role: 'assistant',
      content: '',
    };

    set(() => ({
      executeAbortSignal: new AbortController(),
      isExecuteRunning: true,
    }));

    try {
      const response = await Api.execute(
        {
          id: get().chatId,
          // Add an empty message containing parameters of the current task so backend can use it for this execution
          messages: [...(get().messages || [])],
          relevant_materials: materials,
          agent_id: agentId,
        },
        get().executeAbortSignal.signal,
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let messageDone = false;

      while (true) {
        // this is temporary
        try {
          const { value, done } = (await reader?.read()) || {
            value: undefined,
            done: true,
          };

          const messages = get().messages || [];

          const finishMessage = (newMessageProps: object, force: boolean) => {
            if (messageDone || force) {
              if (messages[messages.length - 1].content === '') {
                messages.pop();
              }

              messages.push(
                createMessage({
                  ...commonMessageAspects,
                  ...newMessageProps,
                }),
              );
              messageDone = false;
            }
          };

          const TOKEN_PROCESSORS = [
            ...[
              'python',
              'bash',
              'shell',
              'javascript',
              'html',
              'applescript',
              'r',
            ].map((language) => ({
              token: `<<<< START CODE (${language}) >>>>`,
              processor: () => {
                finishMessage({ language, code: true }, true);
              },
            })),
            {
              token: '<<<< END CODE >>>>',
              processor: () => {
                if (messageDone) throw new Error('Invalid chunk');
                messageDone = true;
              },
            },
            {
              token: '<<<< CLEAR >>>>',
              processor: () => {
                finishMessage({}, false);
                messages[messages.length - 1].content = '';
              },
            },
          ];

          const textChunk = decoder.decode(value);

          const escapeRegExp = (string: string) =>
            string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const tokens = TOKEN_PROCESSORS.map((processor) => processor.token);
          const regexPattern = new RegExp(
            `(${tokens.map(escapeRegExp).join('|')})`,
            'g',
          );
          const splitText = textChunk
            .split(regexPattern)
            .filter((text) => text !== '');

          console.log(splitText)
          for (const text of splitText) {
            let consumed = false;
            TOKEN_PROCESSORS.forEach((tokenProcessor) => {
              if (text === tokenProcessor.token) {
                tokenProcessor.processor();
                consumed = true;
              }
            });

            if (!consumed) {
              finishMessage({}, false);
              messages[messages.length - 1].content += text;
            }
          }

          set(() => ({
            messages: messages.slice(),
          }));

          if (done) {
            break;
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            console.log('Execution operation aborted');
            return;
          } else {
            throw err;
          }
        }
      }
    } finally {
      //If the message is still empty, remove it
      
      set(({ messages }) => {
        if (messages !== undefined) {
          if (messages[messages.length - 1].content === '') {
            return {
              messages: messages.slice(0, -1),
            };
          }
        }

        return {
          messages,
        };
      });

      get().saveCurrentChatHistory();

      set(() => ({
        isExecuteRunning: false,
      }));
    }

    const messages = get().messages || [];
    const language = messages[messages.length - 1].language;
    if (messages.length > 0 && messages[messages.length - 1].code && language) {
      console.log('Running code');
      await get().doRun(
        agentId,
        task,
        materials,
        language,
        messages[messages.length - 1].content,
      );
    } else {
      console.log('Analysing');
      await get().doAnalysis();
    }
  },

  isWorking: () => get().isAnalysisRunning || get().isExecuteRunning,
  stopWork: () => {
    get().executeAbortSignal.abort();
    get().analysisAbortController.abort();
  },
});
