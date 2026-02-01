'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DatePicker } from '@/components/shared/date-picker';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { ExpenseForm } from './expense-form';
import { useExpenses } from '../hooks/use-expenses';
import { useDeleteExpense } from '../hooks/use-delete-expense';
import { formatDate } from '@/utils/date';
import { expenseCategories } from '../schemas';
import { Pencil, Trash2 } from 'lucide-react';
import type { Expense } from '@/types/entities';
import type { ExpenseCategory } from '@/types/enums';

const categoryLabels: Record<string, string> = {
  TRAVEL: 'Travel',
  SALARY: 'Salary',
  OFFICE: 'Office',
  LEGAL: 'Legal',
  MISC: 'Misc',
};

export function ExpenseList() {
  const [category, setCategory] = useState<ExpenseCategory | undefined>();
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();

  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useDeleteExpense();
  const query = useExpenses({ category, from, to });

  const handleEdit = (expense: Expense) => {
    setEditTarget(expense);
    setEditOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeleteTarget(expense);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteOpen(false),
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select
          value={category ?? 'ALL'}
          onValueChange={(v) => setCategory(v === 'ALL' ? undefined : (v as ExpenseCategory))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            {expenseCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePicker value={from} onChange={(v) => setFrom(v)} placeholder="From" />
        <DatePicker value={to} onChange={(v) => setTo(v)} placeholder="To" />
      </div>

      {/* List */}
      <InfiniteList<Expense>
        query={query}
        itemKey={(e) => e.id}
        renderItem={(expense) => (
          <Card>
            <CardContent className="py-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="text-[10px]">
                      {categoryLabels[expense.category]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(expense.expenseDate)}
                    </span>
                  </div>
                  {expense.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {expense.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <span className="text-sm font-semibold">
                    <CurrencyDisplay amount={expense.amount} />
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(expense)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDelete(expense)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        emptyState={
          <EmptyState title="No expenses" description="No expenses found for the selected filters." />
        }
      />

      {/* Edit Sheet */}
      <ExpenseForm
        open={editOpen}
        onOpenChange={setEditOpen}
        expense={editTarget}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={confirmDelete}
        destructive
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
