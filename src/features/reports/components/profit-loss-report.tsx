'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { EmptyState } from '@/components/shared/empty-state';
import { DateRangePicker, getDefaultDateRange } from './date-range-picker';
import { useProfitLoss } from '../hooks/use-profit-loss';
import {
  Landmark,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  TrendingUp,
  ArrowDownLeft,
  ShieldAlert,
  Receipt,
  HandCoins,
  BadgeDollarSign,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface LineItemProps {
  label: string;
  amount: string;
  icon: LucideIcon;
  highlight?: boolean;
}

function LineItem({ label, amount, icon: Icon, highlight }: LineItemProps) {
  return (
    <div className={`flex items-center justify-between py-3 ${highlight ? 'bg-primary/5 rounded-md px-2 -mx-2' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${highlight ? 'text-primary' : ''}`}>
        <CurrencyDisplay amount={amount} />
      </span>
    </div>
  );
}

export function ProfitLossReport() {
  const defaults = getDefaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);

  const { data, isLoading } = useProfitLoss(from, to);

  return (
    <div className="space-y-4">
      <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 11 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && !data && (
        <EmptyState title="No data" description="No profit & loss data available for the selected period." />
      )}

      {data && (
        <Card>
          <CardContent className="py-2 divide-y">
            <LineItem label="Total Capital Invested" amount={data.totalCapitalInvested} icon={Landmark} />
            <LineItem label="Money Deployed" amount={data.moneyDeployed} icon={ArrowUpRight} />
            <LineItem label="Daily Disbursed" amount={data.dailyDisbursed} icon={CalendarClock} />
            <LineItem label="Monthly Disbursed" amount={data.monthlyDisbursed} icon={CalendarDays} />
            <LineItem label="Total Interest Earned" amount={data.totalInterestEarned} icon={TrendingUp} />
            <LineItem label="Total Received" amount={data.totalReceived} icon={ArrowDownLeft} />
            <LineItem label="Money Lost to Defaults" amount={data.moneyLostToDefaults} icon={ShieldAlert} />
            <LineItem label="Total Expenses" amount={data.totalExpenses} icon={Receipt} />
            <LineItem label="Revenue Forgone" amount={data.revenueForgone} icon={HandCoins} />
            <LineItem label="Net Profit" amount={data.netProfit} icon={BadgeDollarSign} highlight />
            <LineItem label="Cash in Hand" amount={data.cashInHand} icon={Wallet} highlight />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
