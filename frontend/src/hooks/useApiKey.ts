import { useSettings } from '@/store/useSettings';
import { useState } from 'react';

export const useApiKey = () => {
  const [loading, setLoading] = useState(false);
  const setOpenAiApiKey = useSettings((state) => state.setOpenAiApiKey);
  const isApiKeyValid = useSettings((state) => state.isApiKeyValid);
  const validateApiKey = useSettings((state) => state.validateApiKey);

  const setApiKey = async (key: string) => {
    if (loading) return;
    setLoading(true);
    await validateApiKey(key);
    setLoading(false);
    await setOpenAiApiKey(key);
  };

  return {
    setApiKey,
    loading,
    isApiKeyValid,
  };
};
