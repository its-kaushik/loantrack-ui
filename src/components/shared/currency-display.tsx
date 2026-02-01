import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number | string;
  className?: string;
}

export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNegative = value < 0;

  return (
    <span className={cn(isNegative && 'text-destructive', className)}>
      {isNegative ? `- ${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
    </span>
  );
}
