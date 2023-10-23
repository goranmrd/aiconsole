import { cn } from '../utils/styles';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'danger' | 'secondary';
  onClick?: () => void;
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn('rounded text-white px-4 py-1 outline-none', {
        'bg-green-700': variant === 'primary',
        'bg-red-700': variant === 'danger',
        'bg-blue-700': variant === 'secondary',
      })}
    >
      {label}
    </button>
  );
}
