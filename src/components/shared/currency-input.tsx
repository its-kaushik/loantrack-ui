'use client';

import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onValueChange,
  placeholder = 'Enter amount',
  className,
  id,
  disabled,
}: CurrencyInputProps) {
  const [rawInput, setRawInput] = useState(value?.toString() ?? '');

  // Sync external value changes (e.g. from setValue) to internal state
  useEffect(() => {
    const currentNum = parseFloat(rawInput);
    if (value === undefined && rawInput !== '') {
      setRawInput('');
    } else if (value !== undefined && (isNaN(currentNum) || currentNum !== value)) {
      setRawInput(value.toString());
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, '');

      // Prevent multiple dots
      const parts = raw.split('.');
      const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;

      setRawInput(sanitized);
      const num = parseFloat(sanitized);
      onValueChange(isNaN(num) ? undefined : num);
    },
    [onValueChange],
  );

  const preview = value !== undefined && value > 0 ? formatCurrency(value) : '';

  return (
    <div className="space-y-1">
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={rawInput}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(className)}
        disabled={disabled}
      />
      {preview && <p className="text-xs text-muted-foreground">{preview}</p>}
    </div>
  );
}
