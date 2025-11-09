import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TeamLogo from "../shared/TeamLogo";
import PriceDisplay from "../shared/PriceDisplay";
import PercentageChange from "../shared/PercentageChange";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamStockCardProps {
  team: {
    id: string;
    name: string;
    abbreviation: string;
    price: number;
    changePercent?: number | null;
    dayChangePercent?: number | null;
    weekChangePercent?: number | null;
    volume?: number | null;
    value?: number | null;
    division?: string;
    timestamp?: string | null;
    dayRange?: { low: number; high: number } | null;
    weekRange?: { low: number; high: number } | null;
  };
  onTrade?: () => void;
}

const formatNumber = (value?: number | null, options?: Intl.NumberFormatOptions) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", options).format(value);
};

const formatTimestamp = (timestamp?: string | null) => {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString();
};

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const formatted = value.toFixed(2);
  return `${value >= 0 ? "+" : ""}${formatted}%`;
};

const changeColor = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "text-muted-foreground";
  }
  return value >= 0 ? "text-success" : "text-destructive";
};

const rangePosition = (range: { low: number; high: number } | null, price: number) => {
  if (!range || range.low === range.high) return 0.5;
  return Math.min(
    1,
    Math.max(0, (price - range.low) / (range.high - range.low)),
  );
};

export default function TeamStockCard({ team, onTrade }: TeamStockCardProps) {
  const dayPos = rangePosition(team.dayRange ?? null, team.price);
  const weekPos = rangePosition(team.weekRange ?? null, team.price);

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
            <p className="text-xs text-muted-foreground">{team.division || "NFL"}</p>
          </div>
        </div>
        {typeof team.changePercent === "number" && (
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
          <dd className="font-mono">
            ${formatNumber(team.value, { maximumFractionDigits: 2 })}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Volume</dt>
          <dd className="font-mono">
            {formatNumber(team.volume, { maximumFractionDigits: 0 })}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Updated</dt>
          <dd className="font-mono text-xs">{formatTimestamp(team.timestamp)}</dd>
        </div>
      </dl>

      <div className="rounded-lg border p-3 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">1D</span>
          <span className={cn("font-mono", changeColor(team.dayChangePercent))}>
            {formatPercent(team.dayChangePercent)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">1W</span>
          <span className={cn("font-mono", changeColor(team.weekChangePercent))}>
            {formatPercent(team.weekChangePercent)}
          </span>
        </div>
      </div>

      {team.weekRange && (
        <div className="text-xs space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Week Low</span>
            <span>Week High</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">${team.weekRange.low.toFixed(2)}</span>
            <div className="relative h-1 flex-1 rounded-full bg-muted">
              <div
                className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                style={{ left: `${weekPos * 100}%` }}
              />
            </div>
            <span className="font-mono">${team.weekRange.high.toFixed(2)}</span>
          </div>
        </div>
      )}

      {team.dayRange && (
        <div className="text-xs space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Day Range</span>
            <span />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">${team.dayRange.low.toFixed(2)}</span>
            <div className="relative h-1 flex-1 rounded-full bg-muted">
              <div
                className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                style={{ left: `${dayPos * 100}%` }}
              />
            </div>
            <span className="font-mono">${team.dayRange.high.toFixed(2)}</span>
          </div>
        </div>
      )}

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
