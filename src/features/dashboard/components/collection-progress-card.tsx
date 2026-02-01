import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import type { CollectionStats } from '../types';

interface CollectionProgressCardProps {
  expected: CollectionStats;
  received: CollectionStats;
}

export function CollectionProgressCard({ expected, received }: CollectionProgressCardProps) {
  const expectedAmount = parseFloat(expected.totalAmount);
  const receivedAmount = parseFloat(received.totalAmount);
  const percentage = expectedAmount > 0 ? Math.round((receivedAmount / expectedAmount) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Collection Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={receivedAmount} />
            </p>
            <p className="text-xs text-muted-foreground">
              of <CurrencyDisplay amount={expectedAmount} /> expected
            </p>
          </div>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {received.count} of {expected.count} collections
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
