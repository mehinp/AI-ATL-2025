import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/number-format";

type InsightHighlight = {
  label: string;
  value: string;
  description: string;
  trend?: number;
};

type AllocationInsight = {
  label: string;
  percentage: number;
};

interface PortfolioInsightsProps {
  highlights: InsightHighlight[];
  allocations: AllocationInsight[];
}

const formatTrend = (trend?: number) => {
  if (trend === undefined || Number.isNaN(trend)) return null;
  const sign = trend >= 0 ? "+" : "-";
  return `${sign}${Math.abs(trend).toFixed(1)}%`;
};

export default function PortfolioInsights({ highlights, allocations }: PortfolioInsightsProps) {
  return (
    <Card className="p-6" data-testid="portfolio-insights">
      <h2 className="text-lg font-semibold mb-4">Portfolio Insights</h2>

      <div className="grid gap-3 mb-6">
        {highlights.map((item) => {
          const trendLabel = formatTrend(item.trend);
          return (
            <div
              key={item.label}
              className="rounded-lg border px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-base font-semibold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {trendLabel && (
                <span
                  className={`text-sm font-semibold ${
                    (item.trend ?? 0) >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {trendLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Allocation Mix</h3>
          <span className="text-xs text-muted-foreground">Goal-balanced</span>
        </div>
        <div className="space-y-3">
          {allocations.map((allocation) => (
            <div key={allocation.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{allocation.label}</span>
                <span className="font-medium">
                  {formatNumber(allocation.percentage, {
                    maximumFractionDigits: 0,
                  })}
                  %
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, allocation.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
