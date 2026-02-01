'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/shared/currency-input';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DatePicker } from '@/components/shared/date-picker';
import { CustomerPicker } from '@/components/shared/customer-picker';
import { useCreateLoan } from '../hooks/use-create-loan';
import { createMonthlyLoanSchema, createDailyLoanSchema } from '../schemas';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiError } from '@/types/api';
import type { LoanType } from '@/types/enums';
import type { Customer } from '@/types/entities';

interface CreateLoanFormValues {
  loanType: LoanType;
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  disbursementDate: string;
  expectedMonths?: number;
  termDays?: number;
  graceDays?: number;
  guarantorId?: string;
  collateralDescription?: string;
  collateralEstimatedValue?: number;
  notes?: string;
}

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CreateLoanForm() {
  const [loanType, setLoanType] = useState<LoanType>('MONTHLY');
  const [selectedBorrower, setSelectedBorrower] = useState<{ id: string; name: string } | null>(null);
  const [selectedGuarantor, setSelectedGuarantor] = useState<{ id: string; name: string } | null>(null);
  const [showOptional, setShowOptional] = useState(false);
  const [termPreset, setTermPreset] = useState<'120' | '60' | 'custom'>('120');

  const createMutation = useCreateLoan();

  const resolver = useMemo(() => {
    const schema = loanType === 'DAILY' ? createDailyLoanSchema : createMonthlyLoanSchema;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return zodResolver(schema) as any;
  }, [loanType]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLoanFormValues>({
    resolver,
    defaultValues: {
      loanType: 'MONTHLY',
      borrowerId: '',
      principalAmount: undefined,
      interestRate: 5,
      disbursementDate: todayString(),
      termDays: 120,
      graceDays: 0,
    },
    mode: 'onChange',
  });

  const principal = watch('principalAmount');
  const rate = watch('interestRate');
  const termDays = watch('termDays');
  const disbursementDate = watch('disbursementDate');

  // Calculated previews
  const monthlyPreview = useMemo(() => {
    if (loanType !== 'MONTHLY' || !principal || !rate) return null;
    const advanceInterest = principal * rate / 100;
    const monthlyInterest = principal * rate / 100;
    const dueDay = disbursementDate ? new Date(disbursementDate + 'T00:00:00').getDate() : null;
    return { advanceInterest, monthlyInterest, dueDay };
  }, [loanType, principal, rate, disbursementDate]);

  const dailyPreview = useMemo(() => {
    if (loanType !== 'DAILY' || !principal || !rate || !termDays) return null;
    const totalRepayment = principal * (1 + (rate / 100) * (termDays / 30));
    const dailyPayment = totalRepayment / termDays;
    return { totalRepayment, dailyPayment };
  }, [loanType, principal, rate, termDays]);

  const handleTypeChange = (type: LoanType) => {
    setLoanType(type);
    setValue('loanType', type);
  };

  const handleTermPreset = (preset: '120' | '60' | 'custom') => {
    setTermPreset(preset);
    if (preset !== 'custom') {
      setValue('termDays', parseInt(preset), { shouldValidate: true });
    }
  };

  const onSubmit = (data: CreateLoanFormValues) => {
    createMutation.mutate(data as unknown as import('@/types/requests').CreateLoanRequest);
  };

  const apiError = createMutation.error as unknown as ApiError | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Failed to create loan. Please try again.'}
        </div>
      )}

      {/* Loan Type Toggle */}
      <div className="space-y-2">
        <Label>Loan Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={loanType === 'MONTHLY' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => handleTypeChange('MONTHLY')}
          >
            Monthly
          </Button>
          <Button
            type="button"
            variant={loanType === 'DAILY' ? 'default' : 'outline'}
            className="w-full"
            onClick={() => handleTypeChange('DAILY')}
          >
            Daily
          </Button>
        </div>
      </div>

      {/* Borrower */}
      <div className="space-y-2">
        <Label>Borrower</Label>
        <Controller
          name="borrowerId"
          control={control}
          render={({ field }) => (
            <CustomerPicker
              value={field.value}
              selectedCustomer={selectedBorrower}
              onChange={(id, customer: Customer) => {
                field.onChange(id);
                setSelectedBorrower({ id, name: customer.fullName });
              }}
            />
          )}
        />
        {errors.borrowerId && (
          <p className="text-xs text-destructive">{errors.borrowerId.message}</p>
        )}
      </div>

      {/* Principal */}
      <div className="space-y-2">
        <Label>Principal Amount</Label>
        <Controller
          name="principalAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onValueChange={(val) => field.onChange(val)}
              placeholder="Enter principal amount"
            />
          )}
        />
        {errors.principalAmount && (
          <p className="text-xs text-destructive">{errors.principalAmount.message}</p>
        )}
      </div>

      {/* Interest Rate */}
      <div className="space-y-2">
        <Label htmlFor="interestRate">Interest Rate (% per month)</Label>
        <Input
          id="interestRate"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 3"
          {...register('interestRate', { valueAsNumber: true })}
        />
        {errors.interestRate && (
          <p className="text-xs text-destructive">{errors.interestRate.message}</p>
        )}
      </div>

      {/* Monthly-specific: Expected Months */}
      {loanType === 'MONTHLY' && (
        <div className="space-y-2">
          <Label htmlFor="expectedMonths">Expected Months (optional)</Label>
          <Input
            id="expectedMonths"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 12"
            {...register('expectedMonths', { valueAsNumber: true })}
          />
          {errors.expectedMonths && (
            <p className="text-xs text-destructive">{errors.expectedMonths.message}</p>
          )}
        </div>
      )}

      {/* Daily-specific: Term Days */}
      {loanType === 'DAILY' && (
        <>
          <div className="space-y-2">
            <Label>Term Days</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={termPreset === '120' ? 'default' : 'outline'}
                onClick={() => handleTermPreset('120')}
              >
                120 days
              </Button>
              <Button
                type="button"
                size="sm"
                variant={termPreset === '60' ? 'default' : 'outline'}
                onClick={() => handleTermPreset('60')}
              >
                60 days
              </Button>
              <Button
                type="button"
                size="sm"
                variant={termPreset === 'custom' ? 'default' : 'outline'}
                onClick={() => handleTermPreset('custom')}
              >
                Custom
              </Button>
            </div>
            {termPreset === 'custom' && (
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter term days"
                {...register('termDays', { valueAsNumber: true })}
              />
            )}
            {errors.termDays && (
              <p className="text-xs text-destructive">{errors.termDays.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="graceDays">Grace Days (optional)</Label>
            <Input
              id="graceDays"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 5"
              {...register('graceDays', { valueAsNumber: true })}
            />
            {errors.graceDays && (
              <p className="text-xs text-destructive">{errors.graceDays.message}</p>
            )}
          </div>
        </>
      )}

      {/* Disbursement Date */}
      <div className="space-y-2">
        <Label>Disbursement Date</Label>
        <Controller
          name="disbursementDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              placeholder="Select disbursement date"
            />
          )}
        />
        {errors.disbursementDate && (
          <p className="text-xs text-destructive">{errors.disbursementDate.message}</p>
        )}
      </div>

      {/* Calculated Preview */}
      {monthlyPreview && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calculation Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advance Interest</span>
              <span className="font-medium"><CurrencyDisplay amount={monthlyPreview.advanceInterest} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Interest Due</span>
              <span className="font-medium"><CurrencyDisplay amount={monthlyPreview.monthlyInterest} /></span>
            </div>
            {monthlyPreview.dueDay && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Due Day</span>
                <span className="font-medium">{monthlyPreview.dueDay}th of each month</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {dailyPreview && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calculation Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Repayment</span>
              <span className="font-medium"><CurrencyDisplay amount={dailyPreview.totalRepayment} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Payment</span>
              <span className="font-medium"><CurrencyDisplay amount={dailyPreview.dailyPayment} /></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optional Section (Collapsible) */}
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-between text-sm text-muted-foreground"
        onClick={() => setShowOptional(!showOptional)}
      >
        Optional Details
        {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      <div className={cn('space-y-4', !showOptional && 'hidden')}>
        {/* Guarantor */}
        <div className="space-y-2">
          <Label>Guarantor (optional)</Label>
          <Controller
            name="guarantorId"
            control={control}
            render={({ field }) => (
              <CustomerPicker
                value={field.value}
                selectedCustomer={selectedGuarantor}
                onChange={(id, customer: Customer) => {
                  field.onChange(id);
                  setSelectedGuarantor({ id, name: customer.fullName });
                }}
              />
            )}
          />
        </div>

        {/* Collateral Description */}
        <div className="space-y-2">
          <Label htmlFor="collateralDescription">Collateral Description</Label>
          <Textarea
            id="collateralDescription"
            placeholder="Describe the collateral..."
            rows={2}
            {...register('collateralDescription')}
          />
        </div>

        {/* Collateral Value */}
        <div className="space-y-2">
          <Label>Collateral Estimated Value</Label>
          <Controller
            name="collateralEstimatedValue"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                value={field.value}
                onValueChange={(val) => field.onChange(val)}
                placeholder="Enter estimated value"
              />
            )}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes..."
            rows={2}
            {...register('notes')}
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating Loan...' : 'Create Loan'}
      </Button>
    </form>
  );
}
