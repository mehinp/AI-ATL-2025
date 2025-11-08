import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TeamLogo from "../shared/TeamLogo";
import { formatCurrency, formatNumber } from "@/lib/number-format";

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
  onSelectTeam?: (teamName: string) => void;
}

export default function TransactionHistory({ transactions, onSelectTeam }: TransactionHistoryProps) {
  return (
    <Card className="p-6" data-testid="transaction-history">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 rounded-lg hover-elevate -mx-3 cursor-pointer"
            onClick={() => onSelectTeam?.(tx.team.name)}
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
                {formatNumber(tx.shares, { maximumFractionDigits: 0 })} @ {formatCurrency(tx.price)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatCurrency(tx.shares * tx.price)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
