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

import { useSettings } from '@/settings/useSettings';
import { useState } from 'react';

export const useApiKey = () => {
  const [validating, setValidating] = useState(false);
  const saveOpenAiApiKey = useSettings((state) => state.saveOpenAiApiKey);
  const isApiKeyValid = useSettings((state) => state.isApiKeyValid);
  const validateApiKey = useSettings((state) => state.validateApiKey);
  const setApiKey = async (key: string) => {
    if (validating) return false;
    if (key) {
      setValidating(true);
      const isValidNow = await validateApiKey(key);
      setValidating(false);
      if (!isValidNow) return false;
    }
    saveOpenAiApiKey(key);
    return true;
  };

  return {
    setApiKey,
    validating,
    isApiKeyValid,
  };
};
