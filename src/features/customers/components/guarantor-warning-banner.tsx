'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import type { GuarantorWarning } from '@/types/entities';

interface GuarantorWarningBannerProps {
  warnings: GuarantorWarning[];
}

export function GuarantorWarningBanner({ warnings }: GuarantorWarningBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <p className="text-sm font-medium text-destructive">Guarantor Warnings</p>
      </div>
      <div className="space-y-1.5">
        {warnings.map((w) => (
          <Link
            key={w.loanId}
            href={`/loans/${w.loanId}`}
            className="flex items-center justify-between text-sm hover:bg-destructive/5 rounded px-1 py-1"
          >
            <div>
              <span className="font-medium">{w.loanNumber}</span>
              <span className="text-muted-foreground"> — {w.borrowerName}</span>
            </div>
            <StatusBadge status={w.status} variant="loan" />
          </Link>
        ))}
      </div>
    </div>
  );
}
