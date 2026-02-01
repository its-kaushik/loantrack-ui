import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createTenant } from '@/lib/api/platform.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateTenantRequest } from '@/types/requests';

export function useCreateTenant() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: CreateTenantRequest) => createTenant(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.tenants.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });
      toast.success('Tenant onboarded successfully');
      router.push(`/platform/tenants/${data.tenant.id}`);
    },
  });
}
