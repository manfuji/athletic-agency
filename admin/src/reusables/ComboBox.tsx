'use client';

import * as React from 'react';
import { memo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';

interface Country {
  value: string;
  label: string;
  hasFlag?: boolean;
}

interface CountryProps {
  countries: Country[];
  onCountryChange: (country: Country) => void;
  disabled?: boolean;
  value: string;
}

export const Combobox = memo(function Combobox({
  countries,
  onCountryChange,
  value,
}: CountryProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    const selectedCountry = countries.find(
      (country) => country.value === currentValue
    );
    if (selectedCountry) {
      onCountryChange(selectedCountry);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          id="country"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? countries.find((country) => country.value === value)?.label
            : 'Select country...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search country..."
            className="text-gray-500"
          />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  onSelect={() => handleSelect(country.value)}
                  className="flex items-center gap-2"
                >
                  {country.hasFlag && (
                    <Image
                      src={`https://flagcdn.com/24x18/${country.value}.png`}
                      alt={`${country.label} flag`}
                      width={24}
                      height={18}
                    />
                  )}
                  {country.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === country.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
