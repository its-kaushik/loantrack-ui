'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fab } from '@/components/shared/fab';
import { FundSummaryCards } from '@/features/fund/components/fund-summary-cards';
import { FundEntriesList } from '@/features/fund/components/fund-entries-list';
import { FundEntryForm } from '@/features/fund/components/fund-entry-form';
import { Receipt, BarChart3, Users, BookOpen, Plus } from 'lucide-react';

export default function MoneyPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Money" />
      <div className="p-4 space-y-4">
        {/* Fund Summary */}
        <FundSummaryCards />

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
            <Link href="/money/expenses">
              <Receipt className="h-4 w-4" />
              <span className="text-xs">Expenses</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
            <Link href="/money/reports/profit-loss">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">P&L Report</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
            <Link href="/money/reports/collector-summary">
              <Users className="h-4 w-4" />
              <span className="text-xs">Collector Summary</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
            <Link href="/money/reports/loan-book">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Loan Book</span>
            </Link>
          </Button>
        </div>

        {/* Fund Entries */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fund Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <FundEntriesList />
          </CardContent>
        </Card>
      </div>

      <Fab icon={Plus} label="New Entry" onClick={() => setCreateOpen(true)} />
      <FundEntryForm open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
