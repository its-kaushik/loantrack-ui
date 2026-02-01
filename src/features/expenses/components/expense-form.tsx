'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/shared/currency-input';
import { DatePicker } from '@/components/shared/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCreateExpense } from '../hooks/use-create-expense';
import { useUpdateExpense } from '../hooks/use-update-expense';
import {
  createExpenseSchema,
  expenseCategories,
  type CreateExpenseFormValues,
} from '../schemas';
import type { Expense } from '@/types/entities';
import type { CreateExpenseRequest } from '@/types/requests';

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const categoryLabels: Record<string, string> = {
  TRAVEL: 'Travel',
  SALARY: 'Salary',
  OFFICE: 'Office',
  LEGAL: 'Legal',
  MISC: 'Miscellaneous',
};

export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const isEdit = !!expense;
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors },
  } = useForm<CreateExpenseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      category: undefined,
      amount: undefined,
      description: '',
      expenseDate: todayString(),
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        category: expense.category,
        amount: expense.amount,
        description: expense.description ?? '',
        expenseDate: expense.expenseDate,
      });
    } else {
      reset({
        category: undefined,
        amount: undefined,
        description: '',
        expenseDate: todayString(),
      });
    }
  }, [expense, reset]);

  const onSubmit = (data: CreateExpenseFormValues) => {
    const body: CreateExpenseRequest = {
      ...data,
      description: data.description || undefined,
    } as CreateExpenseRequest;

    const mutation = isEdit ? updateMutation : createMutation;
    const mutateArgs = isEdit
      ? { id: expense!.id, body }
      : body;

    if (isEdit) {
      updateMutation.mutate(
        { id: expense!.id, body },
        { onSuccess: () => { onOpenChange(false); reset(); } },
      );
    } else {
      createMutation.mutate(body, {
        onSuccess: () => { onOpenChange(false); reset(); },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Expense' : 'Add Expense'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update expense details.' : 'Record a new expense.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
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
              name="expenseDate"
              control={control}
              render={({ field }) => (
                <DatePicker value={field.value} onChange={field.onChange} placeholder="Select date" />
              )}
            />
            {errors.expenseDate && (
              <p className="text-xs text-destructive">{errors.expenseDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-desc">Description (optional)</Label>
            <Textarea
              id="expense-desc"
              placeholder="What was this expense for?"
              rows={2}
              {...register('description')}
            />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
