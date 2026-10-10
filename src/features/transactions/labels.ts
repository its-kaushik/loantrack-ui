/** Short names for the kinds of payment a person records, as shown in lists and forms. */
export const paymentTypeLabels: Record<string, string> = {
  INTEREST_PAYMENT: 'Interest',
  PRINCIPAL_RETURN: 'Principal Return',
  DAILY_COLLECTION: 'Collection',
  PENALTY: 'Penalty',
  GUARANTOR_PAYMENT: 'Guarantor',
};

export function paymentTypeLabel(type: string | null | undefined): string {
  if (!type) return '';
  return paymentTypeLabels[type] ?? type;
}
