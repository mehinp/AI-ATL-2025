import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TeamLogo from '../shared/TeamLogo';
import PriceDisplay from '../shared/PriceDisplay';
import PercentageChange from '../shared/PercentageChange';
import { TrendingUp } from 'lucide-react';

interface TeamStockCardProps {
  team: {
    id: string;
    name: string;
    abbreviation: string;
    price: number;
    changePercent?: number | null;
    volume?: number | null;
    value?: number | null;
    division?: string;
    timestamp?: string | null;
  };
  onTrade?: () => void;
}

const formatNumber = (value?: number | null, options?: Intl.NumberFormatOptions) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', options).format(value);
};

const formatTimestamp = (timestamp?: string | null) => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString();
};

export default function TeamStockCard({ team, onTrade }: TeamStockCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover-elevate flex flex-col gap-4"
      onClick={onTrade}
      data-testid={`team-stock-${team.abbreviation}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <TeamLogo teamName={team.name} abbreviation={team.abbreviation} size="md" />
          <div>
            <h3 className="font-semibold leading-tight">{team.name}</h3>
            <p className="text-xs text-muted-foreground">
              {team.division || 'NFL'}
            </p>
          </div>
        </div>
        {typeof team.changePercent === 'number' && (
          <PercentageChange value={team.changePercent} />
        )}
      </div>

      <div>
        <span className="text-sm text-muted-foreground">Last Price</span>
        <PriceDisplay price={team.price} size="md" />
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Market Value</dt>
          <dd className="font-mono">${formatNumber(team.value, { maximumFractionDigits: 2 })}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Volume</dt>
          <dd className="font-mono">{formatNumber(team.volume, { maximumFractionDigits: 0 })}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Updated</dt>
          <dd className="font-mono text-xs">{formatTimestamp(team.timestamp)}</dd>
        </div>
      </dl>

      <Button
        className="w-full mt-auto"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onTrade?.();
        }}
        data-testid="button-trade"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        Trade
      </Button>
    </Card>
  );
}
