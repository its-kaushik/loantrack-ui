'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyInput } from '@/components/shared/currency-input';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DatePicker } from '@/components/shared/date-picker';
import { LoanPicker } from '@/components/shared/loan-picker';
import { useLoanDetail } from '@/features/loans/hooks/use-loan-detail';
import { useCreateTransaction } from '../hooks/use-create-transaction';
import { createTransactionSchema, type CreateTransactionFormValues } from '../schemas';
import { generateIdempotencyKey } from '@/utils/idempotency';
import type { ApiError } from '@/types/api';
import type { Loan, MonthlyLoanDetail, DailyLoanDetail } from '@/types/entities';
import type { TransactionType } from '@/types/enums';

const monthlyTransactionTypes: { value: TransactionType; label: string }[] = [
  { value: 'INTEREST_PAYMENT', label: 'Interest Payment' },
  { value: 'PRINCIPAL_RETURN', label: 'Principal Return' },
  { value: 'PENALTY', label: 'Penalty' },
  { value: 'GUARANTOR_PAYMENT', label: 'Guarantor Payment' },
];

const dailyTransactionTypes: { value: TransactionType; label: string }[] = [
  { value: 'DAILY_COLLECTION', label: 'Daily Collection' },
  { value: 'PENALTY', label: 'Penalty' },
  { value: 'GUARANTOR_PAYMENT', label: 'Guarantor Payment' },
];

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function RecordPaymentForm() {
  const searchParams = useSearchParams();
  const prefilledLoanId = searchParams.get('loanId') ?? undefined;

  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const createMutation = useCreateTransaction();

  const [selectedLoan, setSelectedLoan] = useState<{
    id: string;
    loanNumber: string;
    borrowerName: string;
    loanType: string;
  } | null>(null);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<CreateTransactionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTransactionSchema) as any,
    defaultValues: {
      loanId: prefilledLoanId ?? '',
      transactionType: undefined,
      amount: undefined,
      transactionDate: todayString(),
      effectiveDate: undefined,
      penaltyId: undefined,
      notes: '',
    },
    mode: 'onChange',
  });

  const loanId = watch('loanId');
  const transactionType = watch('transactionType');

  // Fetch loan detail for reference amounts
  const { data: loanDetail } = useLoanDetail(loanId || '');

  // Pre-fill selected loan info from detail
  useEffect(() => {
    if (loanDetail && !selectedLoan) {
      setSelectedLoan({
        id: loanDetail.id,
        loanNumber: loanDetail.loanNumber,
        borrowerName: loanDetail.borrowerName,
        loanType: loanDetail.loanType,
      });
      const defaultType = loanDetail.loanType === 'DAILY' ? 'DAILY_COLLECTION' : 'INTEREST_PAYMENT';
      setValue('transactionType', defaultType, { shouldValidate: false });
    }
  }, [loanDetail, selectedLoan, setValue]);

  const loanType = selectedLoan?.loanType ?? loanDetail?.loanType;
  const availableTypes = loanType === 'DAILY' ? dailyTransactionTypes : monthlyTransactionTypes;

  // Reference amounts
  const referenceInfo = useMemo(() => {
    if (!loanDetail) return null;
    if (loanDetail.loanType === 'MONTHLY') {
      const monthly = loanDetail as MonthlyLoanDetail;
      return {
        label: 'Monthly Interest Due',
        amount: monthly.monthlyInterestDue,
      };
    }
    const daily = loanDetail as DailyLoanDetail;
    return {
      label: 'Daily Collection Amount',
      amount: daily.dailyPaymentAmount,
    };
  }, [loanDetail]);

  const handleLoanSelect = (id: string, loan: Loan) => {
    setValue('loanId', id, { shouldValidate: true });
    setSelectedLoan({
      id: loan.id,
      loanNumber: loan.loanNumber,
      borrowerName: loan.borrowerName,
      loanType: loan.loanType,
    });
    // Set default transaction type based on loan type
    const defaultType = loan.loanType === 'DAILY' ? 'DAILY_COLLECTION' : 'INTEREST_PAYMENT';
    setValue('transactionType', defaultType, { shouldValidate: false });
  };

  const onSubmit = (data: CreateTransactionFormValues) => {
    createMutation.mutate({
      ...data,
      effectiveDate: data.effectiveDate || undefined,
      penaltyId: data.penaltyId || undefined,
      notes: data.notes || undefined,
    });
  };

  const apiError = createMutation.error as unknown as ApiError | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Failed to record transaction. Please try again.'}
        </div>
      )}

      {/* Loan Picker */}
      <div className="space-y-2">
        <Label>Loan</Label>
        <Controller
          name="loanId"
          control={control}
          render={({ field }) => (
            <LoanPicker
              value={field.value}
              selectedLoan={selectedLoan}
              onChange={handleLoanSelect}
              disabled={!!prefilledLoanId}
            />
          )}
        />
        {errors.loanId && (
          <p className="text-xs text-destructive">{errors.loanId.message}</p>
        )}
      </div>

      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>Transaction Type</Label>
        <Controller
          name="transactionType"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!loanId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.transactionType && (
          <p className="text-xs text-destructive">{errors.transactionType.message}</p>
        )}
      </div>

      {/* Reference Info */}
      {referenceInfo && (
        <Card className="bg-muted/50">
          <CardContent className="py-2.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{referenceInfo.label}</span>
            <span className="font-medium"><CurrencyDisplay amount={referenceInfo.amount} /></span>
          </CardContent>
        </Card>
      )}

      {/* Amount */}
      <div className="space-y-2">
        <Label>Amount</Label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onValueChange={(val) => field.onChange(val)}
              placeholder="Enter amount"
            />
          )}
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Transaction Date */}
      <div className="space-y-2">
        <Label>Transaction Date</Label>
        <Controller
          name="transactionDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              placeholder="Select date"
            />
          )}
        />
        {errors.transactionDate && (
          <p className="text-xs text-destructive">{errors.transactionDate.message}</p>
        )}
      </div>

      {/* Effective Date (only for INTEREST_PAYMENT) */}
      {transactionType === 'INTEREST_PAYMENT' && (
        <div className="space-y-2">
          <Label>Effective Date (billing cycle)</Label>
          <Controller
            name="effectiveDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select effective date"
              />
            )}
          />
          {errors.effectiveDate && (
            <p className="text-xs text-destructive">{errors.effectiveDate.message}</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes..."
          rows={2}
          {...register('notes')}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Recording...' : 'Record Payment'}
      </Button>
    </form>
  );
}
