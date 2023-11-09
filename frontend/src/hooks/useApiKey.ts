import { Api } from '@/api/Api';
import { useAICStore } from '@/store/AICStore';
import showNotification from '@/utils/showNotification';
import { useState } from 'react';

export const useApiKey = () => {
  const [loading, setLoading] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const setOpenAiApiKey = useAICStore((state) => state.setOpenAiApiKey);
  const setApiKeyValid = useAICStore((state) => state.setApiKeyValid);

  const setApiKey = async (key: string) => {
    if (loading) return;
    setLoading(true);
    const { key_ok } = (await Api.checkKey(key).json()) as {
      key_ok: boolean;
    };
    if (!key_ok) {
      Api.closeProject();
      showNotification({
        title: 'Error',
        message: 'Invalid Open AI API key.',
        variant: 'error',
      });
    }
    setIsApiKeyValid(key_ok);
    setApiKeyValid(key_ok);
    setOpenAiApiKey(key);
    setLoading(false);
  };

  return {
    setApiKey,
    loading,
    isApiKeyValid,
  };
};
