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

import { useState } from 'react';

import { Button } from '../common/Button';
import { useApiKey } from '@/utils/settings/useApiKey';

const OpenAiApiKeyForm = () => {
  const [inputText, setInputText] = useState('');
  const { validating, setApiKey } = useApiKey();

  const onFormSubmit = async () => {
    const successfulySet = await setApiKey(inputText);

    if (successfulySet) {
      setInputText('');
    }
  };

  return (
    <>
      <p className="mt-10 mb-4 text-lg text-center font-semibold text-white">
        First, provide your OpenAI API key with GPT-4 access.
      </p>
      <div className="flex justify-center gap-5">
        <input
          className="border-white/20 ring-secondary/30 text-white bg-black flex-grow resize-none overflow-hidden rounded-3xl border px-4 py-2 focus:outline-none focus:ring-2"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="OpenAI API key..."
        />
        <Button small onClick={onFormSubmit} disabled={!inputText}>
          {validating ? 'Validating...' : 'Submit'}
        </Button>
      </div>
    </>
  );
};

export default OpenAiApiKeyForm;
