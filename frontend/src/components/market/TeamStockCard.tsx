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
    changePercent: number;
    sparkline: number[];
  };
  onTrade?: () => void;
}

export default function TeamStockCard({ team, onTrade }: TeamStockCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover-elevate"
      onClick={onTrade}
      data-testid={`team-stock-${team.abbreviation}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <TeamLogo teamName={team.name} abbreviation={team.abbreviation} size="md" />
          <PercentageChange value={team.changePercent} />
        </div>

        <div>
          <h3 className="font-semibold mb-1">{team.name}</h3>
          <PriceDisplay price={team.price} size="md" />
        </div>

        <div className="h-12 flex items-end gap-0.5">
          {team.sparkline.map((value, index) => {
            const max = Math.max(...team.sparkline);
            const min = Math.min(...team.sparkline);
            const height = ((value - min) / (max - min)) * 100;
            return (
              <div
                key={index}
                className="flex-1 bg-primary/30 rounded-sm"
                style={{ height: `${height || 5}%` }}
              />
            );
          })}
        </div>

        <Button
          className="w-full"
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
      </div>
    </Card>
  );
}
