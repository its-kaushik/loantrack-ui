import type { ExpenseCategory } from '@/types/enums';

export interface ListExpensesFilters {
  category?: ExpenseCategory;
  from?: string;
  to?: string;
}
