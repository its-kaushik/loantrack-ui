'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyInput } from '@/components/shared/currency-input';
import { DatePicker } from '@/components/shared/date-picker';
import { CustomerPicker } from '@/components/shared/customer-picker';
import { useMigrateLoan } from '../hooks/use-migrate-loan';
import { migrateMonthlyLoanSchema, migrateDailyLoanSchema } from '../schemas';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiError } from '@/types/api';
import type { LoanType } from '@/types/enums';
import type { Customer } from '@/types/entities';
import type { MigrateLoanRequest } from '@/types/requests';

interface MigrateLoanFormValues {
  loanType: LoanType;
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  disbursementDate: string;
  expectedMonths?: number;
  termDays?: number;
  graceDays?: number;
  remainingPrincipal?: number;
  lastInterestPaidThrough?: string;
  totalBaseCollectedSoFar?: number;
  preExistingPenalties?: Array<{
    daysOverdue: number;
    monthsCharged: number;
    penaltyAmount: number;
    status: 'PENDING' | 'PAID';
  }>;
  guarantorId?: string;
  collateralDescription?: string;
  collateralEstimatedValue?: number;
  notes?: string;
}

export function MigrateLoanForm() {
  const [loanType, setLoanType] = useState<LoanType>('MONTHLY');
  const [selectedBorrower, setSelectedBorrower] = useState<{ id: string; name: string } | null>(null);
  const [selectedGuarantor, setSelectedGuarantor] = useState<{ id: string; name: string } | null>(null);
  const [showOptional, setShowOptional] = useState(false);
  const [termPreset, setTermPreset] = useState<'120' | '60' | 'custom'>('120');

  const migrateMutation = useMigrateLoan();

  const resolver = useMemo(() => {
    const schema = loanType === 'DAILY' ? migrateDailyLoanSchema : migrateMonthlyLoanSchema;
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
  } = useForm<MigrateLoanFormValues>({
    resolver,
    defaultValues: {
      loanType: 'MONTHLY',
      borrowerId: '',
      principalAmount: undefined,
      interestRate: undefined,
      disbursementDate: '',
      termDays: 120,
      graceDays: 0,
      remainingPrincipal: undefined,
      lastInterestPaidThrough: '',
      totalBaseCollectedSoFar: 0,
      preExistingPenalties: [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'preExistingPenalties',
  });

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

  const onSubmit = (data: MigrateLoanFormValues) => {
    migrateMutation.mutate(data as unknown as MigrateLoanRequest);
  };

  const apiError = migrateMutation.error as unknown as ApiError | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Failed to migrate loan. Please try again.'}
        </div>
      )}

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-3">
          <p className="text-xs text-blue-800">
            Use this form to import an existing loan into the system. Enter the original loan details
            and current state so tracking can continue natively.
          </p>
        </CardContent>
      </Card>

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
        <Label>Original Principal Amount</Label>
        <Controller
          name="principalAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              value={field.value}
              onValueChange={(val) => field.onChange(val)}
              placeholder="Enter original principal"
            />
          )}
        />
        {errors.principalAmount && (
          <p className="text-xs text-destructive">{errors.principalAmount.message}</p>
        )}
      </div>

      {/* Interest Rate */}
      <div className="space-y-2">
        <Label htmlFor="migrate-rate">Interest Rate (% per month)</Label>
        <Input
          id="migrate-rate"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 3"
          {...register('interestRate', { valueAsNumber: true })}
        />
        {errors.interestRate && (
          <p className="text-xs text-destructive">{errors.interestRate.message}</p>
        )}
      </div>

      {/* Disbursement Date */}
      <div className="space-y-2">
        <Label>Original Disbursement Date</Label>
        <Controller
          name="disbursementDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              placeholder="Actual past disbursement date"
            />
          )}
        />
        {errors.disbursementDate && (
          <p className="text-xs text-destructive">{errors.disbursementDate.message}</p>
        )}
      </div>

      {/* Monthly-specific fields */}
      {loanType === 'MONTHLY' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="migrate-expected-months">Expected Months (optional)</Label>
            <Input
              id="migrate-expected-months"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 12"
              {...register('expectedMonths', { valueAsNumber: true })}
            />
          </div>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Migration State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Remaining Principal</Label>
                <Controller
                  name="remainingPrincipal"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      placeholder="Current outstanding principal"
                    />
                  )}
                />
                {errors.remainingPrincipal && (
                  <p className="text-xs text-destructive">{errors.remainingPrincipal.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Last Interest Paid Through</Label>
                <Controller
                  name="lastInterestPaidThrough"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Last cycle end date paid"
                    />
                  )}
                />
                <p className="text-[11px] text-muted-foreground">
                  The date through which all interest cycles are settled.
                </p>
                {errors.lastInterestPaidThrough && (
                  <p className="text-xs text-destructive">{errors.lastInterestPaidThrough.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Daily-specific fields */}
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
            <Label htmlFor="migrate-grace">Grace Days (optional)</Label>
            <Input
              id="migrate-grace"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 5"
              {...register('graceDays', { valueAsNumber: true })}
            />
          </div>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Migration State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Total Collected So Far</Label>
                <Controller
                  name="totalBaseCollectedSoFar"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      placeholder="Amount collected before migration"
                    />
                  )}
                />
                <p className="text-[11px] text-muted-foreground">
                  Total amount collected before importing into the system.
                </p>
                {errors.totalBaseCollectedSoFar && (
                  <p className="text-xs text-destructive">{errors.totalBaseCollectedSoFar.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pre-existing Penalties */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Pre-existing Penalties (optional)</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ daysOverdue: 0, monthsCharged: 0, penaltyAmount: 0, status: 'PENDING' })
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            {fields.length > 0 && (
              <CardContent className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Penalty {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Days Overdue</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 30"
                          {...register(`preExistingPenalties.${index}.daysOverdue`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Months Charged</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 1"
                          {...register(`preExistingPenalties.${index}.monthsCharged`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <Controller
                          name={`preExistingPenalties.${index}.penaltyAmount`}
                          control={control}
                          render={({ field: f }) => (
                            <CurrencyInput
                              value={f.value}
                              onValueChange={(val) => f.onChange(val)}
                              placeholder="Amount"
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Controller
                          name={`preExistingPenalties.${index}.status`}
                          control={control}
                          render={({ field: f }) => (
                            <Select value={f.value} onValueChange={f.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </>
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

        <div className="space-y-2">
          <Label htmlFor="migrate-collateral">Collateral Description</Label>
          <Textarea
            id="migrate-collateral"
            placeholder="Describe the collateral..."
            rows={2}
            {...register('collateralDescription')}
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="migrate-notes">Notes</Label>
          <Textarea
            id="migrate-notes"
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
        disabled={migrateMutation.isPending}
      >
        {migrateMutation.isPending ? 'Migrating Loan...' : 'Migrate Loan'}
      </Button>
    </form>
  );
}
