import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type LoanStatusValue = 'ACTIVE' | 'CLOSED' | 'DEFAULTED' | 'WRITTEN_OFF' | 'CANCELLED';
type ApprovalStatusValue = 'PENDING' | 'APPROVED' | 'REJECTED';
type PenaltyStatusValue = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED';

const loanStatusColors: Record<LoanStatusValue, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
  DEFAULTED: 'bg-red-100 text-red-800 border-red-200',
  WRITTEN_OFF: 'bg-red-200 text-red-900 border-red-300',
  CANCELLED: 'bg-orange-100 text-orange-800 border-orange-200',
};

const approvalStatusColors: Record<ApprovalStatusValue, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const penaltyStatusColors: Record<PenaltyStatusValue, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  PARTIALLY_PAID: 'bg-blue-100 text-blue-800 border-blue-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  WAIVED: 'bg-gray-100 text-gray-800 border-gray-200',
};

interface StatusBadgeProps {
  status: string;
  variant?: 'loan' | 'approval' | 'penalty';
  className?: string;
}

export function StatusBadge({ status, variant = 'loan', className }: StatusBadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';

  if (variant === 'loan' && status in loanStatusColors) {
    colorClass = loanStatusColors[status as LoanStatusValue];
  } else if (variant === 'approval' && status in approvalStatusColors) {
    colorClass = approvalStatusColors[status as ApprovalStatusValue];
  } else if (variant === 'penalty' && status in penaltyStatusColors) {
    colorClass = penaltyStatusColors[status as PenaltyStatusValue];
  }

  const label = status.replace(/_/g, ' ');

  return (
    <Badge variant="outline" className={cn('text-xs font-medium', colorClass, className)}>
      {label}
    </Badge>
  );
}
