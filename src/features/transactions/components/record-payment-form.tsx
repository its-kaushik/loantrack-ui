'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyInput } from '@/components/shared/currency-input';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { DatePicker } from '@/components/shared/date-picker';
import { LoanPicker } from '@/components/shared/loan-picker';
import { useLoanDetail } from '@/features/loans/hooks/use-loan-detail';
import { useCreateTransaction } from '../hooks/use-create-transaction';
import { useEntry, useFixEntry } from '../hooks/use-entry';
import { createTransactionSchema, type CreateTransactionFormValues } from '../schemas';
import { paymentTypeLabel } from '../labels';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import type { ApiError } from '@/types/api';
import type { Loan, MonthlyLoanDetail, DailyLoanDetail } from '@/types/entities';

type PaymentType = CreateTransactionFormValues['transactionType'];

const typeButtonLabels: Record<PaymentType, string> = {
  INTEREST_PAYMENT: 'Interest',
  PRINCIPAL_RETURN: 'Principal',
  DAILY_COLLECTION: 'Collection',
  PENALTY: 'Penalty',
  GUARANTOR_PAYMENT: 'Guarantor',
};

/** The kinds of payment the server accepts for a loan. The first is the usual one. */
function paymentTypesFor(loanType: string | undefined, loanStatus: string | undefined): PaymentType[] {
  if (!loanType) return [];
  const types: PaymentType[] =
    loanType === 'DAILY'
      ? ['DAILY_COLLECTION', 'PENALTY']
      : ['INTEREST_PAYMENT', 'PRINCIPAL_RETURN'];
  // Guarantor payments are only accepted on a defaulted loan
  if (loanStatus === 'DEFAULTED') types.push('GUARANTOR_PAYMENT');
  return types;
}

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function RecordPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledLoanId = searchParams.get('loanId') ?? undefined;
  // Fix mode: correcting a payment that was recorded wrongly. It is undone and
  // replaced by whatever is saved here, as one operation.
  const fixId = searchParams.get('fix') ?? undefined;
  const isFixing = !!fixId;

  const lastPrefilledLoanRef = useRef<string>('');
  const entryAppliedRef = useRef(false);
  const createMutation = useCreateTransaction();
  const fixMutation = useFixEntry(fixId ?? '');
  const { data: entry, isLoading: entryLoading, isError: entryError } = useEntry(fixId);

  const [selectedLoan, setSelectedLoan] = useState<{
    id: string;
    loanNumber: string;
    borrowerName: string;
    loanType: string;
  } | null>(null);
  // A principal return waits here for confirmation before it is sent
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<CreateTransactionFormValues | null>(null);
  const [nothingChanged, setNothingChanged] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
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
      penaltyId: undefined,
      notes: '',
    },
    mode: 'onTouched',
  });

  const loanId = watch('loanId');
  const transactionType = watch('transactionType');
  const amount = watch('amount');

  // Sync prefilledLoanId into form (useSearchParams may resolve after mount during client-side navigation)
  useEffect(() => {
    if (prefilledLoanId && prefilledLoanId !== loanId) {
      setValue('loanId', prefilledLoanId);
    }
  }, [prefilledLoanId, loanId, setValue]);

  // Fix mode: start from the entry exactly as it was recorded
  useEffect(() => {
    if (!entry || !entry.canFix || !entry.transactionType || entryAppliedRef.current) return;
    entryAppliedRef.current = true;
    // keep the entry's own type and amount instead of this loan's defaults
    lastPrefilledLoanRef.current = entry.loanId;

    setSelectedLoan({
      id: entry.loanId,
      loanNumber: entry.loanNumber,
      borrowerName: entry.borrowerName,
      loanType: entry.loanType,
    });
    reset({
      loanId: entry.loanId,
      transactionType: entry.transactionType as PaymentType,
      amount: entry.amount,
      transactionDate: entry.transactionDate ?? todayString(),
      penaltyId: undefined,
      notes: entry.notes ?? '',
    });
  }, [entry, reset]);

  // Fetch loan detail for reference amounts — use prefilledLoanId as fallback
  // so the query fires immediately even before the form's loanId syncs
  const { data: loanDetail } = useLoanDetail(loanId || prefilledLoanId || '');

  // Pre-fill defaults when loanDetail loads (both URL pre-fill and picker cases)
  useEffect(() => {
    if (!loanDetail || loanDetail.id === lastPrefilledLoanRef.current) return;
    lastPrefilledLoanRef.current = loanDetail.id;

    if (!selectedLoan) {
      setSelectedLoan({
        id: loanDetail.id,
        loanNumber: loanDetail.loanNumber,
        borrowerName: loanDetail.borrowerName,
        loanType: loanDetail.loanType,
      });
    }

    const allowed = paymentTypesFor(loanDetail.loanType, loanDetail.status);

    if (isFixing) {
      // The entry is being moved to another loan: keep the amount being corrected,
      // and change the type only if this loan cannot take it
      if (!allowed.includes(getValues('transactionType'))) {
        setValue('transactionType', allowed[0]);
      }
      return;
    }

    setValue('transactionType', allowed[0]);

    const defaultAmount = loanDetail.loanType === 'DAILY'
      ? (loanDetail as DailyLoanDetail).dailyPaymentAmount
      : (loanDetail as MonthlyLoanDetail).monthlyInterestDue;
    if (defaultAmount) {
      setValue('amount', defaultAmount);
    }
  }, [loanDetail, selectedLoan, setValue, getValues, isFixing]);

  const loanType = selectedLoan?.loanType ?? loanDetail?.loanType;
  const loanStatus = loanDetail && loanDetail.id === loanId ? loanDetail.status : undefined;
  const availableTypes = paymentTypesFor(loanType, loanStatus);

  const monthlyLoan =
    loanDetail && loanDetail.id === loanId && loanDetail.loanType === 'MONTHLY'
      ? (loanDetail as MonthlyLoanDetail)
      : null;

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

  // Preview of what a principal return does to the loan. The server applies the real change.
  const principalEffect = useMemo(() => {
    if (transactionType !== 'PRINCIPAL_RETURN' || !monthlyLoan || !amount || amount <= 0) return null;

    // When fixing an entry on this same loan, its own principal return is undone first
    const undone =
      entry && entry.loanId === monthlyLoan.id
        ? entry.rows
            .filter((r) => r.transactionType === 'PRINCIPAL_RETURN')
            .reduce((sum, r) => sum + r.amount, 0)
        : 0;
    const from = monthlyLoan.remainingPrincipal + undone;
    return { from, to: from - amount };
  }, [transactionType, monthlyLoan, amount, entry]);

  // The first unpaid month is due this month or earlier
  const unpaidInterestDueDate =
    monthlyLoan?.nextDueDate &&
    (monthlyLoan.isOverdue || monthlyLoan.nextDueDate.slice(0, 7) <= todayString().slice(0, 7))
      ? monthlyLoan.nextDueDate
      : null;

  const handleLoanSelect = (id: string, loan: Loan) => {
    setValue('loanId', id, { shouldValidate: true });
    setSelectedLoan({
      id: loan.id,
      loanNumber: loan.loanNumber,
      borrowerName: loan.borrowerName,
      loanType: loan.loanType,
    });
    const allowed = paymentTypesFor(loan.loanType, loan.status);
    // Recording: start from this loan's usual type. Fixing: keep the type unless this loan cannot take it.
    if (!isFixing || !allowed.includes(getValues('transactionType'))) {
      setValue('transactionType', allowed[0], { shouldValidate: false });
    }
  };

  const send = (data: CreateTransactionFormValues) => {
    const body = {
      ...data,
      penaltyId: data.penaltyId || undefined,
      notes: data.notes || undefined,
    };

    if (isFixing) {
      fixMutation.mutate(body, {
        onSuccess: () => router.push(`/loans/${body.loanId}`),
      });
    } else {
      createMutation.mutate(body);
    }
  };

  const onSubmit = (data: CreateTransactionFormValues) => {
    if (
      entry &&
      data.loanId === entry.loanId &&
      data.transactionType === entry.transactionType &&
      data.amount === entry.amount &&
      data.transactionDate === entry.transactionDate
    ) {
      setNothingChanged(true);
      return;
    }
    setNothingChanged(false);

    // Taking money off the principal by mistake is the costly error, so it is confirmed first
    if (data.transactionType === 'PRINCIPAL_RETURN') {
      setAwaitingConfirmation(data);
      return;
    }
    send(data);
  };

  const isPending = createMutation.isPending || fixMutation.isPending;
  const apiError = (isFixing ? fixMutation.error : createMutation.error) as unknown as
    | ApiError
    | undefined;

  if (isFixing && entryLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isFixing && (entryError || !entry || !entry.canFix)) {
    return (
      <div className="space-y-4 p-4">
        <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {entry?.reason ?? 'This entry could not be loaded.'}
        </div>
        <Button variant="outline" className="w-full" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const confirmation = awaitingConfirmation;
  const confirmationText = confirmation
    ? [
        principalEffect
          ? `${formatCurrency(confirmation.amount)} will be taken off the principal: ${formatCurrency(principalEffect.from)} to ${formatCurrency(principalEffect.to)}.`
          : `${formatCurrency(confirmation.amount)} will be taken off the principal.`,
        monthlyLoan && unpaidInterestDueDate
          ? `Interest of ${formatCurrency(monthlyLoan.monthlyInterestDue)} due on ${formatDate(unpaidInterestDueDate)} has not been recorded yet.`
          : null,
        'If this was an interest payment, cancel and choose Interest.',
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Failed to record transaction. Please try again.'}
        </div>
      )}

      {/* Fix mode: what is being corrected */}
      {entry && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="py-3 text-sm space-y-1">
            <p className="font-medium">Fixing this entry</p>
            <p>
              {paymentTypeLabel(entry.transactionType)} &middot; <CurrencyDisplay amount={entry.amount} />
              {entry.transactionDate && <> &middot; {formatDate(entry.transactionDate)}</>}
            </p>
            <p className="text-muted-foreground">
              {entry.loanNumber} — {entry.borrowerName}
            </p>
            <p className="text-xs text-muted-foreground">
              It will be undone and replaced by what you save below.
            </p>
          </CardContent>
        </Card>
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
        <Label id="transaction-type-label">Transaction Type</Label>
        <Controller
          name="transactionType"
          control={control}
          render={({ field }) => (
            <div role="group" aria-labelledby="transaction-type-label" className="flex gap-2">
              {availableTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">Select a loan first.</p>
              )}
              {availableTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={field.value === type ? 'default' : 'outline'}
                  aria-pressed={field.value === type}
                  className="flex-1"
                  onClick={() => field.onChange(type)}
                >
                  {typeButtonLabels[type]}
                </Button>
              ))}
            </div>
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
        {principalEffect && (
          <p className="text-xs font-medium text-amber-700">
            Principal will go from <CurrencyDisplay amount={principalEffect.from} /> to{' '}
            <CurrencyDisplay amount={principalEffect.to} />
          </p>
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

      {nothingChanged && (
        <p role="alert" className="text-sm text-destructive">
          Change the loan, type, amount or date before saving.
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isFixing
          ? (isPending ? 'Saving...' : 'Save Correction')
          : (isPending ? 'Recording...' : 'Record Payment')}
      </Button>

      <ConfirmationDialog
        open={confirmation !== null}
        onOpenChange={(open) => !open && setAwaitingConfirmation(null)}
        title="Record as a principal return?"
        description={confirmationText}
        confirmLabel="Yes, Principal Return"
        onConfirm={() => {
          if (confirmation) send(confirmation);
          setAwaitingConfirmation(null);
        }}
        loading={isPending}
      />
    </form>
  );
}
