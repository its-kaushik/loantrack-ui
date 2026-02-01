'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  defaulterFilter: 'all' | 'defaulters' | 'non-defaulters';
  onDefaulterFilterChange: (value: 'all' | 'defaulters' | 'non-defaulters') => void;
}

const filterOptions: { value: 'all' | 'defaulters' | 'non-defaulters'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'defaulters', label: 'Defaulters' },
  { value: 'non-defaulters', label: 'Non-Defaulters' },
];

export function CustomerListFilters({
  search,
  onSearchChange,
  defaulterFilter,
  onDefaulterFilterChange,
}: CustomerListFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={defaulterFilter === opt.value ? 'default' : 'outline'}
            size="sm"
            className={cn('text-xs')}
            onClick={() => onDefaulterFilterChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
