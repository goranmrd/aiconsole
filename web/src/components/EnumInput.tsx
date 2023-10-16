import { Chip, Group } from '@mantine/core';

interface EnumInputProps<T extends string> {
  label: string;
  value: T;
  values: T[];
  className?: string;
  onChange: (value: T) => void;
}

export function EnumInput<T extends string>({
  label,
  value,
  values,
  onChange,
}: EnumInputProps<T>) {
  return (
    <Chip.Group
      value={value}
      onChange={(value: T) => {
        onChange(value);
      }}
    >
      <div className="flex flex-row gap-4">
        <label htmlFor={label} className="font-bold">
          {label}:
        </label>
        <Group justify="center">
          {values.map((value) => (
            <Chip key={value} value={value}>
              {value}
            </Chip>
          ))}
        </Group>
      </div>
    </Chip.Group>
  );
}
