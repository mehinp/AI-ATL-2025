import { Card } from '@/components/ui/card';
import StatCard from '../shared/StatCard';
import { TrendingUp, DollarSign, BarChart3, Target } from 'lucide-react';

interface PortfolioStatsProps {
  totalValue: number;
  totalCost: number;
  dayChange: number;
  dayChangePercent: number;
}

export default function PortfolioStats({ totalValue, totalCost, dayChange, dayChangePercent }: PortfolioStatsProps) {
  const totalProfitLoss = totalValue - totalCost;
  const totalProfitLossPercent = ((totalProfitLoss / totalCost) * 100);

  return (
    <Card className="p-6" data-testid="portfolio-stats">
      <h2 className="text-lg font-semibold mb-4">Performance Stats</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Value"
          value={`$${totalValue.toFixed(2)}`}
        />
        <StatCard
          icon={BarChart3}
          label="Total Cost"
          value={`$${totalCost.toFixed(2)}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Total P&L"
          value={`${totalProfitLoss >= 0 ? '+' : ''}$${totalProfitLoss.toFixed(2)}`}
          subtitle={`${totalProfitLossPercent >= 0 ? '+' : ''}${totalProfitLossPercent.toFixed(2)}%`}
        />
        <StatCard
          icon={Target}
          label="Day Change"
          value={`${dayChange >= 0 ? '+' : ''}$${dayChange.toFixed(2)}`}
          subtitle={`${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(2)}%`}
        />
      </div>
    </Card>
  );
}
