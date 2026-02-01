'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/shared/currency-input';
import { DatePicker } from '@/components/shared/date-picker';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCreateFundEntry } from '../hooks/use-create-fund-entry';
import { createFundEntrySchema, type CreateFundEntryFormValues } from '../schemas';
import type { CreateFundEntryRequest } from '@/types/requests';

interface FundEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function FundEntryForm({ open, onOpenChange }: FundEntryFormProps) {
  const createMutation = useCreateFundEntry();

  const {
    handleSubmit,
    control,
    reset,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFundEntryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createFundEntrySchema) as any,
    defaultValues: {
      entryType: 'INJECTION',
      amount: undefined,
      description: '',
      entryDate: todayString(),
    },
  });

  const entryType = watch('entryType');

  const onSubmit = (data: CreateFundEntryFormValues) => {
    const body: CreateFundEntryRequest = {
      ...data,
      description: data.description || undefined,
    } as CreateFundEntryRequest;

    createMutation.mutate(body, {
      onSuccess: () => {
        onOpenChange(false);
        reset({ entryType: 'INJECTION', amount: undefined, description: '', entryDate: todayString() });
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>New Fund Entry</SheetTitle>
          <SheetDescription>Record a capital injection or withdrawal.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
          {/* Entry Type Toggle */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex rounded-md border">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-l-md transition-colors ${
                  entryType === 'INJECTION'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setValue('entryType', 'INJECTION')}
              >
                Injection
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-r-md transition-colors ${
                  entryType === 'WITHDRAWAL'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setValue('entryType', 'WITHDRAWAL')}
              >
                Withdrawal
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Enter amount"
                />
              )}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Controller
              name="entryDate"
              control={control}
              render={({ field }) => (
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Select date" />
              )}
            />
            {errors.entryDate && (
              <p className="text-xs text-destructive">{errors.entryDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fund-desc">Description (optional)</Label>
            <Textarea
              id="fund-desc"
              placeholder="Notes..."
              rows={2}
              {...register('description')}
            />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? 'Saving...' : 'Add Entry'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
