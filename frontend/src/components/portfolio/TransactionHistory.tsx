import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TeamLogo from '../shared/TeamLogo';

interface Transaction {
  id: string;
  date: string;
  type: 'buy' | 'sell';
  team: { name: string; abbreviation: string };
  shares: number;
  price: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <Card className="p-6" data-testid="transaction-history">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 rounded-lg hover-elevate -mx-3"
            data-testid={`transaction-${tx.id}`}
          >
            <div className="flex items-center gap-3">
              <TeamLogo teamName={tx.team.name} abbreviation={tx.team.abbreviation} size="sm" />
              <div>
                <div className="font-medium">{tx.team.name}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant={tx.type === 'buy' ? 'default' : 'secondary'} className="mb-1">
                {tx.type.toUpperCase()}
              </Badge>
              <div className="text-sm font-mono">
                {tx.shares} @ ${tx.price.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                ${(tx.shares * tx.price).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
