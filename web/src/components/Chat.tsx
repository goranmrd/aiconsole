import { useEffect, useRef, useState } from 'react';
import { MessageGroup } from './MessageGroup';
import { Welcome } from './Welcome';
import { useAICStore } from '../store/AICStore';
import { useWebSocketStore } from '../store/useWebSocketStore';
import { BlinkingCursor } from './BlinkingCursor';
import { cn } from '../utils/styles';
import { UserInfo } from './UserInfo';

export function Chat({ chatId, autoScrolling, setAutoScrolling }: { chatId: string, autoScrolling: boolean, setAutoScrolling: (value: boolean) => void }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState<boolean>(false);
  const timerIdRef = useRef<number | null>(null);

  const calculateGroupedMessages = useAICStore(
    (state) => state.groupedMessages,
  );
  const setChatId = useAICStore((state) => state.setChatId);
  const isAnalysisRunning = useAICStore((state) => state.isAnalysisRunning);
  const isExecuteRunning = useAICStore((state) => state.isExecuteRunning);
  const messages = useAICStore((state) => state.messages);

  {
    const { initWebSocket, disconnect } = useWebSocketStore();

    useEffect(() => {
      if (chatId) {
        initWebSocket(chatId);
      }

      // add return cleanup function to disconnect on unmount
      return () => disconnect();
    }, [initWebSocket, disconnect, chatId]);
  }

  useEffect(() => {
    if (chatId) setChatId(chatId);

    //if there is exactly one text area focus on it
    const textAreas = document.getElementsByTagName('textarea');
    if (textAreas.length === 1) {
      textAreas[0].focus();
    }

    setAutoScrolling(true);
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
  }, [scrolling]);

  useEffect(() => {
    const { current } = messagesEndRef;
    if (!current) return;

    const handleScroll = () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      setScrolling(true);
      timerIdRef.current = setTimeout(() => setScrolling(false), 1000); // Reset scrolling after 1 second.
    };

    current.addEventListener('scroll', handleScroll);
    return () => {
      current.removeEventListener('scroll', handleScroll);
      // It's important to also clear the timer when the component unmounts.
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
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
            {isAnalysisRunning && (
              <div className={cn('flex flex-row  p-5')}>
                <div className="container flex mx-auto gap-4">
                  <UserInfo agent_id={''} materials={[]} />
                  <div className="flex-grow flex flex-col gap-5">
                    <h3 className="italic">
                      Assigning agent ... <BlinkingCursor />{' '}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            {!isAnalysisRunning && <div className="flex flex-row h-4"></div>}
          </div>
        </>
      )}
    </div>
  );
}
