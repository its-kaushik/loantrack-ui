'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateTenant } from '../hooks/use-create-tenant';
import { createTenantSchema, type CreateTenantFormValues } from '../schemas';
import type { CreateTenantRequest } from '@/types/requests';
import type { ApiError } from '@/types/api';

export function OnboardTenantForm() {
  const createMutation = useCreateTenant();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTenantFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTenantSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      address: '',
      adminName: '',
      adminPhone: '',
      adminPassword: '',
    },
  });

  const onSubmit = (data: CreateTenantFormValues) => {
    const body: CreateTenantRequest = {
      ...data,
      ownerEmail: data.ownerEmail || undefined,
      address: data.address || undefined,
    };
    createMutation.mutate(body);
  };

  const apiError = createMutation.error as unknown as ApiError | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Failed to create tenant. Please try again.'}
        </div>
      )}

      {/* Tenant Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenant-name">Business Name</Label>
            <Input
              id="tenant-name"
              placeholder="e.g. Sharma Finance"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant-slug">Slug</Label>
            <Input
              id="tenant-slug"
              placeholder="e.g. sharma-finance"
              {...register('slug')}
            />
            <p className="text-[11px] text-muted-foreground">
              Lowercase letters, numbers, and hyphens only. Used in URLs.
            </p>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-name">Owner Name</Label>
            <Input
              id="owner-name"
              placeholder="Full name of business owner"
              {...register('ownerName')}
            />
            {errors.ownerName && (
              <p className="text-xs text-destructive">{errors.ownerName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-phone">Owner Phone</Label>
            <Input
              id="owner-phone"
              type="tel"
              inputMode="tel"
              placeholder="10-digit phone number"
              {...register('ownerPhone')}
            />
            {errors.ownerPhone && (
              <p className="text-xs text-destructive">{errors.ownerPhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-email">Owner Email (optional)</Label>
            <Input
              id="owner-email"
              type="email"
              placeholder="owner@example.com"
              {...register('ownerEmail')}
            />
            {errors.ownerEmail && (
              <p className="text-xs text-destructive">{errors.ownerEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant-address">Address (optional)</Label>
            <Textarea
              id="tenant-address"
              placeholder="Business address"
              rows={2}
              {...register('address')}
            />
          </div>
        </CardContent>
      </Card>

      {/* First Admin Account */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">First Admin Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Admin Name</Label>
            <Input
              id="admin-name"
              placeholder="Name of first admin user"
              {...register('adminName')}
            />
            {errors.adminName && (
              <p className="text-xs text-destructive">{errors.adminName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-phone">Admin Phone</Label>
            <Input
              id="admin-phone"
              type="tel"
              inputMode="tel"
              placeholder="10-digit phone number"
              {...register('adminPhone')}
            />
            {errors.adminPhone && (
              <p className="text-xs text-destructive">{errors.adminPhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Admin Password</Label>
            <Input
              id="admin-password"
              type="text"
              placeholder="Minimum 8 characters"
              {...register('adminPassword')}
            />
            {errors.adminPassword && (
              <p className="text-xs text-destructive">{errors.adminPassword.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating Tenant...' : 'Onboard Tenant'}
      </Button>
    </form>
  );
}
