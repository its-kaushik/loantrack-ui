'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCustomers } from '@/lib/api/customers.api';
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
import { ChevronsUpDown, Check, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import type { Customer } from '@/types/entities';

interface CustomerPickerProps {
  value: string | undefined;
  selectedCustomer?: { id: string; name: string } | null;
  onChange: (customerId: string, customer: Customer) => void;
  onCreateNew?: () => void;
  disabled?: boolean;
}

export function CustomerPicker({
  value,
  selectedCustomer,
  onChange,
  onCreateNew,
  disabled,
}: CustomerPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useQuery({
    queryKey: ['customers', 'picker', debouncedSearch],
    queryFn: () => listCustomers({ search: debouncedSearch || undefined, limit: 20 }),
    enabled: open,
  });

  const customers = data?.data ?? [];

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
          {selectedCustomer ? selectedCustomer.name : 'Select borrower...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or phone..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No customers found.</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  onSelect={() => {
                    onChange(customer.id, customer);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === customer.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{customer.fullName}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {onCreateNew && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onCreateNew();
                    setOpen(false);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create New Customer
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
