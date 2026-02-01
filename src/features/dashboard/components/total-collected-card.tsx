import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/currency-display';

interface TotalCollectedCardProps {
  amount: string;
}

export function TotalCollectedCard({ amount }: TotalCollectedCardProps) {
  return (
    <Card className="bg-primary/5">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Collected Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-primary">
          <CurrencyDisplay amount={amount} />
        </p>
      </CardContent>
    </Card>
  );
}
