'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

interface RejectionReasonSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (reason: string) => void;
  loading?: boolean;
}

export function RejectionReasonSheet({
  open,
  onOpenChange,
  onReject,
  loading,
}: RejectionReasonSheetProps) {
  const [reason, setReason] = useState('');

  const handleReject = () => {
    if (reason.trim()) {
      onReject(reason.trim());
      setReason('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Reject Transaction</SheetTitle>
          <SheetDescription>
            Please provide a reason for rejecting this transaction.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <Label htmlFor="rejection-reason">Reason</Label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={3}
            className="mt-1.5"
          />
        </div>
        <SheetFooter>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!reason.trim() || loading}
            className="w-full"
          >
            {loading ? 'Rejecting...' : 'Reject Transaction'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
