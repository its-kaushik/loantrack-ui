import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { suspendTenant, activateTenant } from '@/lib/api/platform.api';
import { queryKeys } from '@/lib/query-keys';

export function useSuspendTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suspendTenant(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.tenants.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.tenants.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });
      toast.success('Tenant suspended');
    },
  });
}

export function useActivateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateTenant(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.tenants.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.tenants.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.stats() });
      toast.success('Tenant activated');
    },
  });
}
