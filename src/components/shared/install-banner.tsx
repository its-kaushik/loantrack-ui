'use client';

import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { Download, X } from 'lucide-react';

export function InstallBanner() {
  const { canShow, promptInstall, dismiss } = useInstallPrompt();

  if (!canShow) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-primary p-3 text-primary-foreground shadow-lg">
      <Download className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Install LoanTrack</p>
        <p className="text-xs opacity-80">Add to home screen for quick access</p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="flex-shrink-0"
        onClick={promptInstall}
      >
        Install
      </Button>
      <button onClick={dismiss} className="p-1 hover:opacity-70">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
