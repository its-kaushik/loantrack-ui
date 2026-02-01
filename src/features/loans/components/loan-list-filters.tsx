'use client';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LoanType, LoanStatus } from '@/types/enums';

interface LoanListFiltersProps {
  type: LoanType | undefined;
  onTypeChange: (type: LoanType | undefined) => void;
  status: LoanStatus | undefined;
  onStatusChange: (status: LoanStatus | undefined) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const typeOptions: { label: string; value: LoanType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Daily', value: 'DAILY' },
];

const statusOptions: { label: string; value: LoanStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Defaulted', value: 'DEFAULTED' },
  { label: 'Written Off', value: 'WRITTEN_OFF' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function LoanListFilters({
  type,
  onTypeChange,
  status,
  onStatusChange,
  search,
  onSearchChange,
}: LoanListFiltersProps) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by loan number or borrower..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {typeOptions.map((opt) => (
          <Badge
            key={opt.label}
            variant={type === opt.value ? 'default' : 'outline'}
            className={cn('cursor-pointer flex-shrink-0', type === opt.value && 'bg-primary')}
            onClick={() => onTypeChange(opt.value)}
          >
            {opt.label}
          </Badge>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusOptions.map((opt) => (
          <Badge
            key={opt.label}
            variant={status === opt.value ? 'default' : 'outline'}
            className={cn('cursor-pointer flex-shrink-0', status === opt.value && 'bg-primary')}
            onClick={() => onStatusChange(opt.value)}
          >
            {opt.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
