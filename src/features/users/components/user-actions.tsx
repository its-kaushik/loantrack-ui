'use client';

import { useState } from 'react';
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
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { useDeactivateUser } from '../hooks/use-deactivate-user';
import { useResetPassword } from '../hooks/use-reset-password';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas';
import { ShieldOff, KeyRound } from 'lucide-react';
import type { User } from '@/types/entities';

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const deactivateMutation = useDeactivateUser();
  const resetMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(resetPasswordSchema) as any,
    defaultValues: { newPassword: '' },
  });

  const handleDeactivate = () => {
    deactivateMutation.mutate(user.id, {
      onSuccess: () => setDeactivateOpen(false),
    });
  };

  const handleResetPassword = (data: ResetPasswordFormValues) => {
    resetMutation.mutate(
      { id: user.id, newPassword: data.newPassword },
      {
        onSuccess: () => {
          setResetOpen(false);
          reset();
        },
      },
    );
  };

  return (
    <>
      <div className="flex gap-1">
        {user.isActive && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => setDeactivateOpen(true)}
          >
            <ShieldOff className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setResetOpen(true)}
        >
          <KeyRound className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ConfirmationDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate User"
        description="This will revoke their access immediately. The user will no longer be able to log in."
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
        destructive
        loading={deactivateMutation.isPending}
      />

      <Sheet open={resetOpen} onOpenChange={setResetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Reset Password</SheetTitle>
            <SheetDescription>Set a new password for {user.name}.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="text"
                placeholder="Enter new password (min 8 characters)"
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <SheetFooter>
              <Button type="submit" disabled={resetMutation.isPending} className="w-full">
                {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
