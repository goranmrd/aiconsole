import { useEffect, useState } from 'react';

export const BlinkingCursor = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible((v) => !v);
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      className={`bg-slate-400 inline-block h-3 w-2 ${
        visible ? '' : 'invisible'
      }`}
    />
  );
};
