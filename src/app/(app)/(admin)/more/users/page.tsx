'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Fab } from '@/components/shared/fab';
import { UserList } from '@/features/users/components/user-list';
import { CreateUserForm } from '@/features/users/components/create-user-form';
import { UserPlus } from 'lucide-react';

export default function UsersPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <PageHeader title="User Management" backHref="/more" />
      <div className="p-4">
        <UserList />
      </div>
      <Fab icon={UserPlus} label="Add Collector" onClick={() => setCreateOpen(true)} />
      <CreateUserForm open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
