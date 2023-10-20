import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function AutoScroll({ children, className }: Props) {
  const [autoScroll, setAutoScroll] = useState(true);
  const containerElement = useRef<HTMLDivElement>(null);
  const style = {
    overflow: 'auto',
    scrollBehavior: 'smooth',
    pointerEvents: 'auto',
  } as const;

  const onWheel = () => {
    const { current } = containerElement;

    if (current) {
      setAutoScroll(
        current.scrollTop + current.offsetHeight === current.scrollHeight,
      );
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const { current } = containerElement;

      if (current) {
        current.style.scrollBehavior = 'smooth';
      }
    }, 0);
  }, [containerElement]);

  useEffect(() => {
    if (!autoScroll) {
      return;
    }

    const { current } = containerElement;

    if (current) {
      current.scrollTop = current.scrollHeight;
    }
  }, [children, containerElement, autoScroll]);

  return (
    <div className={className}>
      <div onWheel={onWheel} ref={containerElement} style={style}>
        {children}
      </div>
    </div>
  );
}
