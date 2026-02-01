import type { FundEntryType } from '@/types/enums';

export interface ListFundEntriesFilters {
  entryType?: FundEntryType;
  from?: string;
  to?: string;
}
