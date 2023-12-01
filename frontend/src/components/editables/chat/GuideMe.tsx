import { useChatStore } from '@/store/editables/chat/useChatStore';
import { BlinkingCursor } from './BlinkingCursor';

export const GuideMe = () => {
  const thinkingProcess = useChatStore((store) => store.analysis.thinking_process);
  const nextStep = useChatStore((store) => store.analysis.next_step);

  return (
    <div className="rounded-lg border border-gray-600 guide-gradient p-[20px] text-[15px] text-gray-300 leading-[24px] w-full">
      {thinkingProcess}
      {nextStep && (
        <span className="text-white">
          <br /> Next step: <span className="text-purple-400 leading-[24px]">{nextStep}</span>
        </span>
      )}
      &nbsp;
      <BlinkingCursor />
    </div>
  );
};
