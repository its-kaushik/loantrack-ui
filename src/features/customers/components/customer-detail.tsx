'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GuarantorWarningBanner } from './guarantor-warning-banner';
import { CustomerLoansList } from './customer-loans-list';
import { Phone, Pencil } from 'lucide-react';
import type { CustomerDetail as CustomerDetailType } from '@/types/entities';

interface CustomerDetailProps {
  customer: CustomerDetailType;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export function CustomerDetailView({ customer }: CustomerDetailProps) {
  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold">{customer.fullName}</h1>
            {customer.isDefaulter && (
              <Badge variant="outline" className="text-[10px] text-red-800 bg-red-100 border-red-200">
                Defaulter
              </Badge>
            )}
          </div>
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Phone className="h-3.5 w-3.5" />
            {customer.phone}
          </a>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/customers/${customer.id}/edit`}>
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Guarantor Warnings */}
      <GuarantorWarningBanner warnings={customer.guarantorWarnings} />

      {/* Customer Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Customer Info</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {customer.alternatePhone && (
            <InfoRow
              label="Alt. Phone"
              value={
                <a href={`tel:${customer.alternatePhone}`} className="text-primary hover:underline">
                  {customer.alternatePhone}
                </a>
              }
            />
          )}
          {customer.address && <InfoRow label="Address" value={customer.address} />}
          {customer.aadhaarNumber && <InfoRow label="Aadhaar" value={customer.aadhaarNumber} />}
          {customer.panNumber && <InfoRow label="PAN" value={customer.panNumber} />}
          {customer.idProofType && <InfoRow label="ID Proof" value={customer.idProofType} />}
          {customer.occupation && <InfoRow label="Occupation" value={customer.occupation} />}
          {customer.notes && <InfoRow label="Notes" value={customer.notes} />}
        </CardContent>
      </Card>

      {/* Customer's Loans */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerLoansList customerId={customer.id} />
        </CardContent>
      </Card>
    </div>
  );
}
