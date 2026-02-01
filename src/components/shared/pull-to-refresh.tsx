'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown>;
  children: ReactNode;
}

const PULL_THRESHOLD = 80;

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing || startY.current === 0) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
        setPullDistance(Math.min(diff * 0.5, PULL_THRESHOLD * 1.5));
      }
    },
    [isRefreshing],
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD * 0.6);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden transition-all duration-200',
          pullDistance === 0 && !isRefreshing && 'duration-300',
        )}
        style={{ height: pullDistance }}
      >
        <Loader2
          className={cn(
            'h-5 w-5 text-muted-foreground transition-opacity',
            isRefreshing && 'animate-spin',
            pullDistance >= PULL_THRESHOLD ? 'opacity-100' : 'opacity-50',
          )}
        />
      </div>
      {children}
    </div>
  );
}
