'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterProps {
  options: string[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export default function Filter({
  options,
  placeholder = 'Filter',
  value,
  defaultValue = 'All',
  onValueChange,
}: FilterProps) {
  const handleValueChange = onValueChange || (() => {});

  return (
    <Select
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-50 bg-white shadow-lg">
        {options.map((option) => (
          <SelectItem key={option} value={option} className="font-inter">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
