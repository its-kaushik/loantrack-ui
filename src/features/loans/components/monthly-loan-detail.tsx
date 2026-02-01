'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { WaiveInterestSheet } from '@/features/penalties/components/waive-interest-sheet';
import { PaymentStatusTable } from './payment-status-table';
import { LoanTransactionList } from './loan-transaction-list';
import { useCloseLoan, useDefaultLoan, useWriteOffLoan, useCancelLoan } from '../hooks/use-loan-actions';
import { formatDate } from '@/utils/date';
import { Info, Receipt, XCircle, AlertTriangle, Ban, PercentCircle } from 'lucide-react';
import type { MonthlyLoanDetail as MonthlyLoanDetailType } from '@/types/entities';

interface MonthlyLoanDetailProps {
  loan: MonthlyLoanDetailType;
}

function MetricRow({ label, value, tooltip }: { label: string; value: React.ReactNode; tooltip?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        {label}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function MonthlyLoanDetail({ loan }: MonthlyLoanDetailProps) {
  const closeMutation = useCloseLoan(loan.id);
  const defaultMutation = useDefaultLoan(loan.id);
  const writeOffMutation = useWriteOffLoan(loan.id);
  const cancelMutation = useCancelLoan(loan.id);

  const [closeOpen, setCloseOpen] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [waiveInterestOpen, setWaiveInterestOpen] = useState(false);

  const isActive = loan.status === 'ACTIVE';
  const isDefaulted = loan.status === 'DEFAULTED';

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-lg font-bold">{loan.loanNumber}</h1>
          <StatusBadge status={loan.status} variant="loan" />
          {loan.isMigrated && (
            <Badge variant="outline" className="text-[10px]">Migrated</Badge>
          )}
        </div>
        <Link href={`/customers/${loan.borrowerId}`} className="text-sm text-primary hover:underline">
          {loan.borrowerName}
        </Link>
        <Badge variant="outline" className="ml-2 text-[10px]">MONTHLY</Badge>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <MetricRow label="Principal" value={<CurrencyDisplay amount={loan.principalAmount} />} />
          <MetricRow label="Remaining Principal" value={<CurrencyDisplay amount={loan.remainingPrincipal} />} />
          <MetricRow
            label="Billing Principal"
            value={<CurrencyDisplay amount={loan.billingPrincipal} />}
            tooltip="Billing principal = Original principal − Principal returned. Monthly interest is calculated on this amount."
          />
          <MetricRow label="Interest Rate" value={`${loan.interestRate}% / month`} />
          <MetricRow label="Advance Interest" value={<CurrencyDisplay amount={loan.advanceInterestAmount} />} />
          <MetricRow label="Monthly Due Day" value={`${loan.monthlyDueDay}th`} />
          <MetricRow label="Monthly Interest Due" value={<CurrencyDisplay amount={loan.monthlyInterestDue} />} />
          <MetricRow label="Total Interest Collected" value={<CurrencyDisplay amount={loan.totalInterestCollected} />} />
          <MetricRow label="Months Active" value={loan.monthsActive} />
          {loan.nextDueDate && <MetricRow label="Next Due Date" value={formatDate(loan.nextDueDate)} />}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {(isActive || isDefaulted) && (
        <Card>
          <CardContent className="py-3 flex flex-wrap gap-2">
            {isActive && (
              <Button size="sm" asChild>
                <Link href={`/more/transactions/new?loanId=${loan.id}`}>
                  <Receipt className="mr-1 h-4 w-4" />
                  Record Payment
                </Link>
              </Button>
            )}
            {isActive && (
              <Button size="sm" variant="outline" onClick={() => setWaiveInterestOpen(true)}>
                <PercentCircle className="mr-1 h-4 w-4" />
                Waive Interest
              </Button>
            )}
            {isActive && (
              <Button size="sm" variant="outline" onClick={() => setCloseOpen(true)}>
                <XCircle className="mr-1 h-4 w-4" />
                Close
              </Button>
            )}
            {isActive && (
              <Button size="sm" variant="outline" className="text-destructive border-destructive" onClick={() => setDefaultOpen(true)}>
                <AlertTriangle className="mr-1 h-4 w-4" />
                Default
              </Button>
            )}
            {isDefaulted && (
              <Button size="sm" variant="outline" className="text-destructive border-destructive" onClick={() => setWriteOffOpen(true)}>
                Write Off
              </Button>
            )}
            {isActive && (
              <Button size="sm" variant="ghost" onClick={() => setCancelOpen(true)}>
                <Ban className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentStatusTable loanId={loan.id} />
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <LoanTransactionList loanId={loan.id} />
        </CardContent>
      </Card>

      {/* Loan Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Loan Info</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <MetricRow label="Disbursement Date" value={formatDate(loan.disbursementDate)} />
          {loan.expectedMonths && <MetricRow label="Expected Months" value={loan.expectedMonths} />}
          {loan.guarantorName && <MetricRow label="Guarantor" value={loan.guarantorName} />}
          {loan.collateralDescription && <MetricRow label="Collateral" value={loan.collateralDescription} />}
          {loan.collateralEstimatedValue && (
            <MetricRow label="Collateral Value" value={<CurrencyDisplay amount={loan.collateralEstimatedValue} />} />
          )}
          {loan.notes && <MetricRow label="Notes" value={loan.notes} />}
          {loan.closureDate && <MetricRow label="Closure Date" value={formatDate(loan.closureDate)} />}
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title="Close Loan"
        description="Are you sure you want to close this loan? This action indicates the loan has been fully repaid."
        onConfirm={() => closeMutation.mutate()}
        loading={closeMutation.isPending}
      />
      <ConfirmationDialog
        open={defaultOpen}
        onOpenChange={setDefaultOpen}
        title="Mark as Defaulted"
        description="This will mark the loan as defaulted and flag the borrower as a defaulter."
        onConfirm={() => defaultMutation.mutate()}
        destructive
        loading={defaultMutation.isPending}
      />
      <ConfirmationDialog
        open={writeOffOpen}
        onOpenChange={setWriteOffOpen}
        title="Write Off Loan"
        description="This will write off the loan as unrecoverable. This action cannot be undone."
        onConfirm={() => writeOffMutation.mutate()}
        destructive
        loading={writeOffMutation.isPending}
      />
      <ConfirmationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel Loan"
        description="Are you sure you want to cancel this loan? This action cannot be undone."
        onConfirm={() => cancelMutation.mutate('')}
        destructive
        loading={cancelMutation.isPending}
      />

      <WaiveInterestSheet
        open={waiveInterestOpen}
        onOpenChange={setWaiveInterestOpen}
        loanId={loan.id}
        monthlyInterestDue={loan.monthlyInterestDue}
      />
    </div>
  );
}
