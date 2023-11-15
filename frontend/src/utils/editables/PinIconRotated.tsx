import { PinIcon } from 'lucide-react';

// A version of PinIcon that is rotated 45 degrees (also transfer all the props)

export function PinIconRotated(props: React.ComponentProps<typeof PinIcon>) {
  const { style, ...rest } = props;

  return (
    <PinIcon
      {...rest}
      style={{
        ...style,
        transform: 'rotate(45deg)',
      }}
    />
  );
}
