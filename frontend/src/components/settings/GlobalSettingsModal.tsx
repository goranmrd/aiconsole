// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useApiKey } from '@/utils/settings/useApiKey';
import { useSettingsStore } from '@/store/settings/useSettingsStore';
import { Modal } from '@mantine/core';
import { Ban, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../common/Button';
import { useLocation, useNavigate } from 'react-router-dom';

// TODO: implement other features from figma like api for azure, user profile and tutorial
export const GlobalSettingsModal = () => {
  const openAiApiKey = useSettingsStore((state) => state.openAiApiKey);

  const alwaysExecuteCode = useSettingsStore((state) => state.alwaysExecuteCode);
  const [inputText, setInputText] = useState(openAiApiKey ?? '');
  const [isAutoRun, setIsAutoRun] = useState(alwaysExecuteCode);
  const { validating, setApiKey } = useApiKey();

  const location = useLocation();
  const isSettingsModalVisible = location.state?.isSettingsModalVisible;
  const navigate = useNavigate();

  const onClose = () => {
    navigate(location.pathname, { 
      state: { ...location.state, isSettingsModalVisible: false } 
    })
  };


  const setAutoCodeExecution = useSettingsStore((state) => state.setAutoCodeExecution);

  const save = async () => {
    if (isAutoRun !== alwaysExecuteCode) {
      setAutoCodeExecution(isAutoRun);
    }

    if (inputText !== openAiApiKey) {
      const successfulySet = await setApiKey(inputText);

      if (!successfulySet) {
        return;
      }
    }

    onClose();
  };

  return (
    <Modal
      opened={isSettingsModalVisible}
      onClose={onClose}
      centered
      className="mantine-Modal-root"
      withCloseButton={false}
      padding={25}
      fullScreen
      styles={{
        header: {
          backgroundColor: '#111111',
          textAlign: 'center',
        },
        content: {
          backgroundColor: '#111111',
          color: '#fff',
        },
      }}
    >
      <div className="flex justify-between items-center px-[5px] pb-[26px] pt-[1px] ">
        <img src={`favicon.svg`} className="h-[48px] w-[48px] cursor-pointer filter" />
        <Button variant="secondary" onClick={onClose} small>
          <X />
          Close
        </Button>
      </div>
      <div className="h-[calc(100vh-100px)] max-w-[720px] mx-auto">
        <h3 className="uppercase p-[30px] text-gray-400 text-[14px] leading-[21px] text-center mb-[40px]">Settings</h3>
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
            <h4 className="text-gray-300 font-semibold text-[16px] leading-[19px]">Always run code</h4>
            <div className="flex items-center gap-[10px]">
              <Button statusColor={isAutoRun ? 'green' : 'base'} variant="status" onClick={() => setIsAutoRun(true)}>
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
            <h4 className="text-gray-300 font-semibold text-[16px] leading-[19px]">API</h4>
            <input
              className="border-gray-500 ring-secondary/30 text-gray-300 bg-gray-800 flex-grow resize-none overflow-hidden rounded-[8px] border px-4 py-2 focus:border-gray-300 focus:outline-none focus:text-white"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="OpenAI API key..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-[10px] py-[60px] mt-[40px]">
          <Button variant="secondary" bold onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{validating ? 'Validating...' : 'Save'}</Button>
        </div>
      </div>
    </Modal>
  );
};
