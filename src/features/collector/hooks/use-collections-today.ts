import { useQuery } from '@tanstack/react-query';
import { listLoans } from '@/lib/api/loans.api';
import { listTransactions } from '@/lib/api/transactions.api';
import { listCustomers } from '@/lib/api/customers.api';
import { useAuthStore } from '@/stores/auth-store';
import type { CollectionTodayItem } from '../types';

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useCollectionsToday() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['collector', 'collections-today', userId],
    queryFn: async (): Promise<CollectionTodayItem[]> => {
      // Fetch active daily loans, today's transactions, and customers in parallel
      const [loansRes, txRes, customersRes] = await Promise.all([
        listLoans({ type: 'DAILY', status: 'ACTIVE', limit: 200 }),
        listTransactions({
          transactionType: 'DAILY_COLLECTION',
          collectedBy: userId,
          page: 1,
          limit: 200,
        }),
        listCustomers({ limit: 500 }),
      ]);

      const today = todayString();

      // Build a map of loanId -> submitted amount for today
      const todaySubmissions = new Map<string, number>();
      for (const tx of txRes.data) {
        if (tx.transactionDate === today) {
          const existing = todaySubmissions.get(tx.loanId) ?? 0;
          todaySubmissions.set(tx.loanId, existing + tx.amount);
        }
      }

      // Build a map of customerId -> phone
      const customerPhones = new Map<string, string>();
      for (const customer of customersRes.data) {
        customerPhones.set(customer.id, customer.phone);
      }

      return loansRes.data.map((loan) => ({
        ...loan,
        borrowerPhone: customerPhones.get(loan.borrowerId) ?? null,
        submittedToday: todaySubmissions.has(loan.id),
        submittedAmount: todaySubmissions.get(loan.id) ?? 0,
      }));
    },
    enabled: !!userId,
  });
}
