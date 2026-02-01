'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createCustomerSchema, type CreateCustomerFormValues } from '../schemas';
import type { ApiError } from '@/types/api';
import type { CustomerDetail } from '@/types/entities';

interface CustomerFormProps {
  initialData?: CustomerDetail;
  onSubmit: (data: CreateCustomerFormValues) => void;
  isPending: boolean;
  error: Error | null;
  submitLabel?: string;
}

export function CustomerForm({
  initialData,
  onSubmit,
  isPending,
  error,
  submitLabel = 'Create Customer',
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCustomerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createCustomerSchema) as any,
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          phone: initialData.phone,
          alternatePhone: initialData.alternatePhone ?? '',
          address: initialData.address ?? '',
          aadhaarNumber: initialData.aadhaarNumber ?? '',
          panNumber: initialData.panNumber ?? '',
          idProofType: initialData.idProofType ?? '',
          occupation: initialData.occupation ?? '',
          notes: initialData.notes ?? '',
        }
      : {
          fullName: '',
          phone: '',
          alternatePhone: '',
          address: '',
          aadhaarNumber: '',
          panNumber: '',
          idProofType: '',
          occupation: '',
          notes: '',
        },
  });

  const apiError = error as unknown as ApiError | undefined;

  const handleFormSubmit = (data: CreateCustomerFormValues) => {
    // Clean empty strings to undefined for optional fields
    const cleaned = {
      ...data,
      alternatePhone: data.alternatePhone || undefined,
      address: data.address || undefined,
      aadhaarNumber: data.aadhaarNumber || undefined,
      panNumber: data.panNumber || undefined,
      idProofType: data.idProofType || undefined,
      occupation: data.occupation || undefined,
      notes: data.notes || undefined,
    };
    onSubmit(cleaned);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          placeholder="Enter full name"
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          placeholder="Enter phone number"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Alternate Phone */}
      <div className="space-y-2">
        <Label htmlFor="alternatePhone">Alternate Phone</Label>
        <Input
          id="alternatePhone"
          type="tel"
          inputMode="tel"
          placeholder="Enter alternate phone"
          {...register('alternatePhone')}
        />
        {errors.alternatePhone && (
          <p className="text-xs text-destructive">{errors.alternatePhone.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="Enter address"
          rows={2}
          {...register('address')}
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address.message}</p>
        )}
      </div>

      {/* Aadhaar Number */}
      <div className="space-y-2">
        <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
        <Input
          id="aadhaarNumber"
          type="text"
          inputMode="numeric"
          placeholder="12-digit Aadhaar number"
          maxLength={12}
          {...register('aadhaarNumber')}
        />
        {errors.aadhaarNumber && (
          <p className="text-xs text-destructive">{errors.aadhaarNumber.message}</p>
        )}
      </div>

      {/* PAN Number */}
      <div className="space-y-2">
        <Label htmlFor="panNumber">PAN Number</Label>
        <Input
          id="panNumber"
          type="text"
          placeholder="e.g. ABCDE1234F"
          maxLength={10}
          {...register('panNumber')}
        />
        {errors.panNumber && (
          <p className="text-xs text-destructive">{errors.panNumber.message}</p>
        )}
      </div>

      {/* ID Proof Type */}
      <div className="space-y-2">
        <Label htmlFor="idProofType">ID Proof Type</Label>
        <Input
          id="idProofType"
          placeholder="e.g. Aadhaar, PAN, Voter ID"
          {...register('idProofType')}
        />
      </div>

      {/* Occupation */}
      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation</Label>
        <Input
          id="occupation"
          placeholder="Enter occupation"
          {...register('occupation')}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes..."
          rows={2}
          {...register('notes')}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
