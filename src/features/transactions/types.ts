import type { ApprovalStatus, TransactionType } from '@/types/enums';

export interface ListTransactionsParams {
  approvalStatus?: ApprovalStatus;
  transactionType?: TransactionType;
  loanId?: string;
  collectedBy?: string;
  page?: number;
  limit?: number;
}
