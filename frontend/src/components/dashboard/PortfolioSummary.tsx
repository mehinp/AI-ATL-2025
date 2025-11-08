import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Wallet, Briefcase } from 'lucide-react';
import PriceDisplay from '../shared/PriceDisplay';
import PercentageChange from '../shared/PercentageChange';
import StatCard from '../shared/StatCard';

interface PortfolioSummaryProps {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  cashBalance: number;
  holdingsCount: number;
}

export default function PortfolioSummary({
  totalValue,
  dayChange,
  dayChangePercent,
  cashBalance,
  holdingsCount
}: PortfolioSummaryProps) {
  return (
    <Card className="p-6" data-testid="portfolio-summary">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Portfolio Summary</h2>
          <div className="flex items-end gap-3">
            <PriceDisplay price={totalValue} size="lg" />
            <PercentageChange value={dayChangePercent} size="md" />
          </div>
          <div className={`text-sm font-medium mt-2 ${dayChange >= 0 ? 'text-success' : 'text-danger'}`}>
            {dayChange >= 0 ? '+' : ''}${Math.abs(dayChange).toFixed(2)} today
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={Wallet}
            label="Cash Balance"
            value={`$${cashBalance.toFixed(2)}`}
          />
          <StatCard
            icon={Briefcase}
            label="Holdings"
            value={holdingsCount}
            subtitle="Teams"
          />
          <StatCard
            icon={TrendingUp}
            label="Day P&L"
            value={`${dayChange >= 0 ? '+' : ''}$${Math.abs(dayChange).toFixed(2)}`}
          />
        </div>
      </div>
    </Card>
  );
}
