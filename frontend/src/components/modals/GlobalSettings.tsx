import { Settings, Check, Ban } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { useAICStore } from '@/store/AICStore';
import { useState } from 'react';
import { Button } from '../system/Button';

interface GlobalSettingsProps {
  onClick: () => void;
}
// TODO: implement other features from figma like api for azure, user profile and tutorial
export const GlobalSettings = ({ onClick }: GlobalSettingsProps) => {
  const openAiApiKey = useAICStore((state) => state.openAiApiKey);
  const alwaysExecuteCode = useAICStore((state) => state.alwaysExecuteCode);
  const [inputText, setInputText] = useState(openAiApiKey ?? '');
  const [isAutoRun, setIsAutoRun] = useState(alwaysExecuteCode);

  const setOpenAiApiKey = useAICStore((state) => state.setOpenAiApiKey);

  const enableAutoCodeExecution = useAICStore(
    (state) => state.setAutoCodeExecution,
  );

  const save = () => {
    enableAutoCodeExecution(isAutoRun);
    setOpenAiApiKey(inputText);
  };

  return (
    <SettingsModal
      onSubmit={save}
      onClose={onClick}
      title="AI Console Settings"
      openModalButton={
        <div className="flex items-center text-[14px] p-[8px] rounded-[5px] hover:bg-gray-700 cursor-pointer gap-[10px] w-full">
          <Settings className="w-[18px] h-[18px]" /> Settings
        </div>
      }
    >
      <div className="flex flex-col gap-[40px]">
        {/* <h3 className="text-gray-400 text-[14px] leading-5">User settings</h3>
        <div>
          <img
            src={`${getBaseURL()}/profile/user.jpg` || ''}
            className="h-11 w-11 rounded-full border cursor-pointer shadow-md border-primary mb-3"
          />
        </div> */}
        <h3 className="text-gray-400 text-[14px] leading-5">System settings</h3>
        <div className="flex items-center gap-[30px]">
          <h4 className="text-gray-300 font-semibold text-[16px] leading-[19px]">
            Always run code
          </h4>
          <div className="flex items-center gap-[10px]">
            <Button
              statusColor={isAutoRun ? 'green' : 'base'}
              variant="status"
              onClick={() => setIsAutoRun(true)}
            >
              <Check /> YES
            </Button>
            <Button
              statusColor={isAutoRun == false ? 'red' : 'base'}
              variant="status"
              onClick={() => setIsAutoRun(false)}
            >
              <Ban /> NO
            </Button>
          </div>
        </div>
        <div className="border border-gray-600 rounded-[8px] p-[20px] flex items-center gap-[30px]">
          <h4 className="text-gray-300 font-semibold text-[16px] leading-[19px]">
            API
          </h4>
          <input
            className="border-gray-500 ring-secondary/30 text-gray-300 bg-gray-800 flex-grow resize-none overflow-hidden rounded-[8px] border px-4 py-2 focus:border-gray-300 focus:outline-none focus:text-white"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="OpenAI API key..."
          />
        </div>
      </div>
    </SettingsModal>
  );
};
