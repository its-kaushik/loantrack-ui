'use client';

import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateString(str: string): Date {
  return parse(str, 'yyyy-MM-dd', new Date());
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  id,
  disabled,
}: DatePickerProps) {
  const selected = value ? fromDateString(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(toDateString(date));
    }
  };

  const handleToday = () => {
    onChange(toDateString(new Date()));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(fromDateString(value), 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} />
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" onClick={handleToday}>
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
