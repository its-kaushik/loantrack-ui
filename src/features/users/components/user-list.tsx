'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { UserActions } from './user-actions';
import { useUsers } from '../hooks/use-users';
import type { User } from '@/types/entities';

const roleBadgeStyle: Record<string, string> = {
  ADMIN: 'text-blue-700 border-blue-200',
  COLLECTOR: 'text-purple-700 border-purple-200',
};

function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{user.name}</p>
              {!user.isActive && (
                <Badge variant="outline" className="text-[10px] text-red-700 border-red-200">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{user.phone}</p>
            <Badge variant="outline" className={`text-[10px] mt-1 ${roleBadgeStyle[user.role] ?? ''}`}>
              {user.role}
            </Badge>
          </div>
          {user.role === 'COLLECTOR' && <UserActions user={user} />}
        </div>
      </CardContent>
    </Card>
  );
}

export function UserList() {
  const { data, isLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No users" description="No team members found." />;
  }

  return (
    <div className="space-y-2">
      {data.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
