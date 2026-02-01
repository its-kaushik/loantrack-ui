'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaginatedResponse } from '@/types/api';

interface InfiniteListProps<T> {
  query: UseInfiniteQueryResult<InfiniteData<PaginatedResponse<T>>>;
  renderItem: (item: T, index: number) => ReactNode;
  emptyState: ReactNode;
  itemKey: (item: T) => string;
}

export function InfiniteList<T>({
  query,
  renderItem,
  emptyState,
  itemKey,
}: InfiniteListProps<T>) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = query;
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.pagination?.total ?? 0;

  if (allItems.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">{total} total</p>
      <div className="space-y-2">
        {allItems.map((item, index) => (
          <div key={itemKey(item)}>{renderItem(item, index)}</div>
        ))}
      </div>
      <div ref={observerRef} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
