import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TeamLogo from '../shared/TeamLogo';
import PriceDisplay from '../shared/PriceDisplay';
import PercentageChange from '../shared/PercentageChange';

interface StockHoldingCardProps {
  team: {
    name: string;
    abbreviation: string;
  };
  shares: number;
  avgCost: number;
  currentPrice: number;
  onSell?: () => void;
}

export default function StockHoldingCard({ team, shares, avgCost, currentPrice, onSell }: StockHoldingCardProps) {
  const totalValue = shares * currentPrice;
  const totalCost = shares * avgCost;
  const profitLoss = totalValue - totalCost;
  const profitLossPercent = ((profitLoss / totalCost) * 100);

  return (
    <Card className="p-4 border-l-4 border-l-primary" data-testid={`stock-holding-${team.abbreviation}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo teamName={team.name} abbreviation={team.abbreviation} size="md" />
            <div>
              <div className="font-semibold">{team.name}</div>
              <div className="text-sm text-muted-foreground">{shares} shares</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onSell} data-testid="button-sell">
            Sell
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Avg Cost</div>
            <div className="font-mono font-semibold">${avgCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Current</div>
            <div className="font-mono font-semibold">${currentPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Value</div>
            <div className="font-mono font-semibold">${totalValue.toFixed(2)}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">P&L</span>
            <div className="flex items-center gap-2">
              <span className={`font-mono font-semibold ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
              </span>
              <PercentageChange value={profitLossPercent} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
