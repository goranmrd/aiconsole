import { useSettings } from '@/store/useSettings';
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
