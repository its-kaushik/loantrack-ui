'use client';

import { PageHeader } from '@/components/shared/page-header';
import { ProfitLossReport } from '@/features/reports/components/profit-loss-report';

export default function ProfitLossPage() {
  return (
    <div>
      <PageHeader title="Profit & Loss" backHref="/money" />
      <div className="p-4">
        <ProfitLossReport />
      </div>
    </div>
  );
}
