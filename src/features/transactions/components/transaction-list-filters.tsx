'use client';

import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/shared/date-picker';
import { listUsers } from '@/lib/api/users.api';
import { queryKeys } from '@/lib/query-keys';
import type { ApprovalStatus, TransactionType } from '@/types/enums';

interface TransactionListFiltersProps {
  approvalStatus: ApprovalStatus | undefined;
  onApprovalStatusChange: (value: ApprovalStatus | undefined) => void;
  transactionType: TransactionType | undefined;
  onTransactionTypeChange: (value: TransactionType | undefined) => void;
  collectedBy: string | undefined;
  onCollectedByChange: (value: string | undefined) => void;
}

const statusOptions: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const typeOptions: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'INTEREST_PAYMENT', label: 'Interest' },
  { value: 'PRINCIPAL_RETURN', label: 'Principal Return' },
  { value: 'DAILY_COLLECTION', label: 'Collection' },
  { value: 'PENALTY', label: 'Penalty' },
  { value: 'GUARANTOR_PAYMENT', label: 'Guarantor' },
];

export function TransactionListFilters({
  approvalStatus,
  onApprovalStatusChange,
  transactionType,
  onTransactionTypeChange,
  collectedBy,
  onCollectedByChange,
}: TransactionListFiltersProps) {
  const { data: users } = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: listUsers,
  });

  const collectors = (users ?? []).filter((u) => u.role === 'COLLECTOR');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {/* Status Filter */}
        <Select
          value={approvalStatus ?? 'ALL'}
          onValueChange={(v) => onApprovalStatusChange(v === 'ALL' ? undefined : v as ApprovalStatus)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={transactionType ?? 'ALL'}
          onValueChange={(v) => onTransactionTypeChange(v === 'ALL' ? undefined : v as TransactionType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Collector Filter */}
      {collectors.length > 0 && (
        <Select
          value={collectedBy ?? 'ALL'}
          onValueChange={(v) => onCollectedByChange(v === 'ALL' ? undefined : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Collectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Collectors</SelectItem>
            {collectors.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
