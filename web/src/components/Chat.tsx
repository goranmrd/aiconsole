import { useEffect } from 'react';

import { MessageGroup } from '@/components/message/MessageGroup';
import { Welcome } from '@/components/Welcome';
import { useAICStore } from '@/store/AICStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Analysis } from './Analysis';
import AutoScroll from './AutoScroll';

export function Chat({ chatId }: { chatId: string }) {
  const calculateGroupedMessages = useAICStore(
    (state) => state.groupedMessages,
  );
  const setChatId = useAICStore((state) => state.setChatId);
  const isAnalysisRunning = useAnalysisStore(
    (state) => state.isAnalysisRunning,
  );
  const isExecuteRunning = useAICStore((state) => state.isExecuteRunning);
  const messages = useAICStore((state) => state.messages);
  const stopWork = useAICStore((state) => state.stopWork);

  useEffect(() => {
    setChatId(chatId);

    //if there is exactly one text area focus on it
    const textAreas = document.getElementsByTagName('textarea');
    if (textAreas.length === 1) {
      textAreas[0].focus();
    }

    return () => {
      stopWork();
      setChatId('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]); //Initentional trigger when chat_id changes

  const groupedMessages = calculateGroupedMessages();

  return (
    <AutoScroll className="h-full overflow-y-auto flex flex-col">
      {messages?.length === 0 ? (
        <Welcome />
      ) : (
        <>
          <div>
            {groupedMessages.map((group, index) => (
              <MessageGroup
                group={group}
                key={group.id}
                isStreaming={
                  isExecuteRunning && index === groupedMessages.length - 1
                }
              />
            ))}
            <Analysis />
            {!isAnalysisRunning && <div className="flex flex-row h-4"></div>}
          </div>
        </>
      )}
    </AutoScroll>
  );
}
