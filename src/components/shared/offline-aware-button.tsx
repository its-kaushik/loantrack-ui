'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOnlineStatus } from '@/hooks/use-online-status';

type OfflineAwareButtonProps = React.ComponentProps<typeof Button> & {
  children: React.ReactNode;
};

export function OfflineAwareButton({ children, disabled, ...props }: OfflineAwareButtonProps) {
  const isOnline = useOnlineStatus();
  const isDisabled = disabled || !isOnline;

  if (!isOnline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button {...props} disabled>
                {children}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Requires network connection</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button {...props} disabled={isDisabled}>
      {children}
    </Button>
  );
}
