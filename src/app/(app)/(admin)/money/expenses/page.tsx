'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Fab } from '@/components/shared/fab';
import { ExpenseList } from '@/features/expenses/components/expense-list';
import { ExpenseForm } from '@/features/expenses/components/expense-form';
import { Plus } from 'lucide-react';

export default function ExpensesPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Expenses" backHref="/money" />
      <div className="p-4">
        <ExpenseList />
      </div>
      <Fab icon={Plus} label="Add Expense" onClick={() => setCreateOpen(true)} />
      <ExpenseForm open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
