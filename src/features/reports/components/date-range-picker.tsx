'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/shared/date-picker';

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function firstOfMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

function lastOfMonth(date: Date): string {
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
}

export function getDefaultDateRange(): { from: string; to: string } {
  const now = new Date();
  return { from: firstOfMonth(now), to: todayString() };
}

export function DateRangePicker({ from, to, onFromChange, onToChange }: DateRangePickerProps) {
  const applyPreset = (preset: 'this-month' | 'last-month' | 'this-year') => {
    const now = new Date();
    switch (preset) {
      case 'this-month':
        onFromChange(firstOfMonth(now));
        onToChange(todayString());
        break;
      case 'last-month': {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        onFromChange(firstOfMonth(prev));
        onToChange(lastOfMonth(prev));
        break;
      }
      case 'this-year':
        onFromChange(`${now.getFullYear()}-01-01`);
        onToChange(todayString());
        break;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto">
        <Button variant="outline" size="sm" onClick={() => applyPreset('this-month')}>
          This Month
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset('last-month')}>
          Last Month
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset('this-year')}>
          This Year
        </Button>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <DatePicker value={from} onChange={onFromChange} placeholder="From" />
        </div>
        <div className="flex-1">
          <DatePicker value={to} onChange={onToChange} placeholder="To" />
        </div>
      </div>
    </div>
  );
}
