'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { CollectionCalendar } from './collection-calendar';
import { LoanTransactionList } from './loan-transaction-list';
import { PenaltyList } from '@/features/penalties/components/penalty-list';
import { useCloseLoan, useDefaultLoan, useWriteOffLoan, useCancelLoan } from '../hooks/use-loan-actions';
import { formatDate } from '@/utils/date';
import { Info, Receipt, XCircle, AlertTriangle, Ban, AlertOctagon } from 'lucide-react';
import type { DailyLoanDetail as DailyLoanDetailType } from '@/types/entities';

interface DailyLoanDetailProps {
  loan: DailyLoanDetailType;
  readOnly?: boolean;
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

export function DailyLoanDetail({ loan, readOnly }: DailyLoanDetailProps) {
  const closeMutation = useCloseLoan(loan.id);
  const defaultMutation = useDefaultLoan(loan.id);
  const writeOffMutation = useWriteOffLoan(loan.id);
  const cancelMutation = useCancelLoan(loan.id);

  const [closeOpen, setCloseOpen] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const isActive = loan.status === 'ACTIVE';
  const isDefaulted = loan.status === 'DEFAULTED';
  const progressPercent = loan.totalRepaymentAmount > 0
    ? Math.min(100, (loan.totalCollected / loan.totalRepaymentAmount) * 100)
    : 0;

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
        <Badge variant="outline" className="ml-2 text-[10px]">DAILY</Badge>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Collection Progress</span>
            <span className="font-medium">{progressPercent.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
            <span><CurrencyDisplay amount={loan.totalCollected} /> collected</span>
            <span><CurrencyDisplay amount={loan.totalRepaymentAmount} /> total</span>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Alert */}
      {loan.isOverdue && isActive && (
        <Card className="border-destructive">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Overdue</p>
                <p className="text-xs text-muted-foreground">
                  This loan is {loan.daysOverdue} day{loan.daysOverdue !== 1 ? 's' : ''} overdue.
                  Penalty may be applicable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <MetricRow label="Principal" value={<CurrencyDisplay amount={loan.principalAmount} />} />
          <MetricRow label="Total Repayment" value={<CurrencyDisplay amount={loan.totalRepaymentAmount} />} />
          <MetricRow
            label="Daily Amount"
            value={<CurrencyDisplay amount={loan.dailyPaymentAmount} />}
            tooltip="Fixed daily collection amount = Total repayment ÷ Term days"
          />
          <MetricRow label="Interest Rate" value={`${loan.interestRate}% / month`} />
          <MetricRow label="Term Days" value={loan.termDays} />
          <MetricRow label="Grace Days" value={loan.graceDays} />
          <MetricRow label="Days Elapsed" value={loan.daysElapsed} />
          <MetricRow label="Days Paid" value={loan.daysPaid} />
          <MetricRow label="Days Remaining" value={loan.daysRemaining} />
          <MetricRow label="Total Collected" value={<CurrencyDisplay amount={loan.totalCollected} />} />
          <MetricRow label="Total Remaining" value={<CurrencyDisplay amount={loan.totalRemaining} />} />
          {loan.isOverdue && <MetricRow label="Days Overdue" value={<span className="text-destructive">{loan.daysOverdue}</span>} />}
          <MetricRow label="Term End Date" value={formatDate(loan.termEndDate)} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {!readOnly && (isActive || isDefaulted) && (
        <Card>
          <CardContent className="py-3 flex flex-wrap gap-2">
            {isActive && (
              <Button size="sm" asChild>
                <Link href={`/more/transactions/new?loanId=${loan.id}`}>
                  <Receipt className="mr-1 h-4 w-4" />
                  Record Collection
                </Link>
              </Button>
            )}
            {isActive && loan.isOverdue && (
              <Button size="sm" variant="outline" className="text-destructive border-destructive" asChild>
                <Link href={`/more/penalties/new?loanId=${loan.id}`}>
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Impose Penalty
                </Link>
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

      {/* Collection Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Collection Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-green-500" />
              <span>Paid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-red-500" />
              <span>Missed</span>
            </div>
          </div>
          <CollectionCalendar loanId={loan.id} />
        </CardContent>
      </Card>

      {/* Penalties */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Penalties</CardTitle>
        </CardHeader>
        <CardContent>
          <PenaltyList loanId={loan.id} />
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
    </div>
  );
}
