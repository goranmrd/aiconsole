import { useEffect, useRef, useState } from 'react';

import { MessageGroup } from '@/components/message/MessageGroup';
import { Welcome } from '@/components/Welcome';
import { useAICStore } from '@/store/AICStore';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { Analysis } from './Analysis';

export function Chat({
  chatId,
  autoScrolling,
  setAutoScrolling,
}: {
  chatId: string;
  autoScrolling: boolean;
  setAutoScrolling: (value: boolean) => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState<boolean>(false);
  const [timerIdRef, setTimerIdRef] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

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

    setAutoScrolling(true);

    return () => {
      stopWork();
      setChatId('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]); //Initentional trigger when chat_id changes

  useEffect(() => {
    setAutoScrolling(false);

    if (!scrolling) {
      //check if we are at the bottom of the chat
      const { current } = messagesEndRef;
      if (!current) return;

      const atBottom =
        Math.abs(
          current.scrollTop - (current.scrollHeight - current.clientHeight),
        ) < 150;

      if (atBottom) {
        setAutoScrolling(true);
      }
    }
    // intentional trigger when scrolling changes
  }, [scrolling]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const { current } = messagesEndRef;
    if (!current) return;

    const handleScroll = () => {
      if (timerIdRef) {
        clearTimeout(timerIdRef);
        setTimerIdRef(null);
      }
      setScrolling(true);
      setTimerIdRef(setTimeout(() => setScrolling(false), 1000)); // Reset scrolling after 1 second.
    };

    current.addEventListener('scroll', handleScroll);
    return () => {
      current.removeEventListener('scroll', handleScroll);
      // It's important to also clear the timer when the component unmounts.
      if (timerIdRef) {
        clearTimeout(timerIdRef);
        setTimerIdRef(null);
      }
    };
  }, []);

  const lastContent =
    messages && messages[messages.length - 1]
      ? messages[messages.length - 1].content
      : undefined;
  useEffect(() => {
    const { current } = messagesEndRef;
    if (!current) return;

    if (autoScrolling) {
      current.scrollTop = Number.MAX_SAFE_INTEGER;
    }
    // scrolling intentionally ommited
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    messages?.length,
    lastContent,
    isExecuteRunning,
    isAnalysisRunning,
    prompt,
  ]);

  const groupedMessages = calculateGroupedMessages();

  return (
    <div className="h-full overflow-y-auto flex flex-col" ref={messagesEndRef}>
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
    </div>
  );
}
