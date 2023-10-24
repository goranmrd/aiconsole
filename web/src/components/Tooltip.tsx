import { Tooltip as MantineTooltip, TooltipProps } from '@mantine/core';

export const Tooltip = ({
  children,
  position = 'top',
  ...props
}: TooltipProps) => {
  return (
    <MantineTooltip position={position} {...props}>
      {children}
    </MantineTooltip>
  );
};
