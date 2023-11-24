import { RefObject, useCallback, useEffect } from 'react';

type Handler = (event: MouseEvent) => void;

export const useClickOutside = <T extends HTMLElement = HTMLElement>(ref: RefObject<T>, callback: Handler) => {
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    },
    [callback, ref],
  );

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
};
