'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCreateUser } from '../hooks/use-create-user';
import { createUserSchema, type CreateUserFormValues } from '../schemas';
import type { CreateUserRequest } from '@/types/requests';

interface CreateUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserForm({ open, onOpenChange }: CreateUserFormProps) {
  const createMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      name: '',
      phone: '',
      password: '',
      role: 'COLLECTOR',
    },
  });

  const onSubmit = (data: CreateUserFormValues) => {
    createMutation.mutate(data as CreateUserRequest, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Create Collector</SheetTitle>
          <SheetDescription>Add a new collector to your team.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              placeholder="Full name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-phone">Phone</Label>
            <Input
              id="user-phone"
              type="tel"
              inputMode="tel"
              placeholder="10-digit phone number"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="text"
              placeholder="Minimum 8 characters"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <SheetFooter>
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? 'Creating...' : 'Create Collector'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
