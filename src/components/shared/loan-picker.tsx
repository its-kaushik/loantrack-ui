'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listLoans } from '@/lib/api/loans.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import type { Loan } from '@/types/entities';

interface LoanPickerProps {
  value: string | undefined;
  selectedLoan?: { id: string; loanNumber: string; borrowerName: string; loanType: string } | null;
  onChange: (loanId: string, loan: Loan) => void;
  disabled?: boolean;
}

export function LoanPicker({
  value,
  selectedLoan,
  onChange,
  disabled,
}: LoanPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useQuery({
    queryKey: ['loans', 'picker', debouncedSearch],
    queryFn: () => listLoans({ search: debouncedSearch || undefined, status: 'ACTIVE', limit: 20 }),
    enabled: open,
  });

  const loans = data?.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selectedLoan ? (
            <span className="truncate">
              {selectedLoan.loanNumber} — {selectedLoan.borrowerName}
            </span>
          ) : (
            'Select loan...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by loan number or borrower..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No active loans found.</CommandEmpty>
            <CommandGroup>
              {loans.map((loan) => (
                <CommandItem
                  key={loan.id}
                  onSelect={() => {
                    onChange(loan.id, loan);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === loan.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm truncate">{loan.loanNumber}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {loan.loanType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{loan.borrowerName}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
