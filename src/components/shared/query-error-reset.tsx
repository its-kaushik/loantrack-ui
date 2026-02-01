'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface QueryErrorResetProps {
  message?: string;
  onRetry: () => void;
}

export function QueryErrorReset({
  message = 'Something went wrong while loading data.',
  onRetry,
}: QueryErrorResetProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <RefreshCw className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-foreground">Failed to load</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">{message}</p>
      <Button onClick={onRetry} className="mt-4" size="sm" variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}
