'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useFundSummary } from '@/features/dashboard/hooks/use-fund-summary';
import { queryKeys } from '@/lib/query-keys';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Landmark,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Receipt,
  HandCoins,
  BadgeDollarSign,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  amount: string;
  icon: LucideIcon;
  highlight?: boolean;
}

function KpiCard({ label, amount, icon: Icon, highlight }: KpiCardProps) {
  return (
    <Card className={highlight ? 'bg-primary/5 border-primary/20' : undefined}>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className={`text-sm font-bold ${highlight ? 'text-primary' : ''}`}>
              <CurrencyDisplay amount={amount} />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FundSummaryPage() {
  const { data, isLoading, isError } = useFundSummary();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.fundSummary() });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Failed to load fund summary. Pull down to retry.
      </div>
    );
  }

  const kpis: { label: string; amount: string; icon: LucideIcon; highlight?: boolean }[] = [
    { label: 'Total Capital Invested', amount: data.totalCapitalInvested, icon: Landmark },
    { label: 'Money Deployed', amount: data.moneyDeployed, icon: ArrowUpRight },
    { label: 'Total Interest Earned', amount: data.totalInterestEarned, icon: TrendingUp },
    { label: 'Money Lost to Defaults', amount: data.moneyLostToDefaults, icon: ShieldAlert },
    { label: 'Total Expenses', amount: data.totalExpenses, icon: Receipt },
    { label: 'Revenue Forgone', amount: data.revenueForgone, icon: HandCoins },
    { label: 'Net Profit', amount: data.netProfit, icon: BadgeDollarSign, highlight: true },
    { label: 'Cash in Hand', amount: data.cashInHand, icon: Wallet, highlight: true },
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="grid grid-cols-2 gap-3 p-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            amount={kpi.amount}
            icon={kpi.icon}
            highlight={kpi.highlight}
          />
        ))}
      </div>
    </PullToRefresh>
  );
}
