import { Card } from "@/components/ui/card";
import { useMemo, useState } from "react";
import StockChart, { ChartRange } from "@/components/market/StockChart";

interface DataPoint {
  date: string;
  value: number;
  timestamp?: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = DAY_MS * 7;
const MONTH_MS = WEEK_MS * 4;

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [range, setRange] = useState<ChartRange>("1W");

  const { chartData, latestValue, weekChangePercent, monthChangePercent, priceDomain } =
    useMemo(() => {
      if (!data.length) {
        return {
          chartData: [],
          latestValue: 0,
          weekChangePercent: null,
          monthChangePercent: null,
          priceDomain: undefined,
        };
      }

      const baseTimestamp = Date.now() - (data.length - 1) * DAY_MS;

      const normalized = data
        .map((point, index) => {
          const parsed = point.timestamp ?? Date.parse(point.date);
          const timestamp = Number.isNaN(parsed)
            ? baseTimestamp + index * DAY_MS
            : parsed;
          const dateLabel = new Date(timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
          return {
            time: dateLabel,
            price: point.value,
            timestamp,
          };
        })
        .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

      const latest = normalized[normalized.length - 1];
      const latestTs = latest?.timestamp ?? Date.now();

      const referenceFor = (
        sorted: typeof normalized,
        windowMs: number,
        latestTimestamp: number,
      ) => {
        const threshold = latestTimestamp - windowMs;
        return (
          [...sorted]
            .reverse()
            .find((entry) => entry.timestamp && entry.timestamp <= threshold) ||
          sorted[0]
        );
      };

      const changeFrom = (
        currentPrice: number,
        reference?: { price: number } | null,
      ) => {
        if (!reference?.price) return null;
        if (!currentPrice) return null;
        return ((currentPrice - reference.price) / reference.price) * 100;
      };

      const weekRef = referenceFor(normalized, WEEK_MS, latestTs);
      const monthRef = referenceFor(normalized, MONTH_MS, latestTs);

      const values = normalized.map((point) => point.price);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = Math.max((max - min) * 0.1, min * 0.05 || 10);
      const domain: [number, number] = [Math.max(0, min - padding), max + padding];

      return {
        chartData: normalized,
        latestValue: latest?.price ?? 0,
        weekChangePercent: changeFrom(latest?.price ?? 0, weekRef),
        monthChangePercent: changeFrom(latest?.price ?? 0, monthRef),
        priceDomain: domain,
      };
    }, [data]);

  return (
    <Card className="p-6" data-testid="performance-chart">
      <StockChart
        teamName="Portfolio"
        data={chartData}
        range={range}
        onRangeChange={setRange}
        price={latestValue}
        weekChangePercent={weekChangePercent}
        monthChangePercent={monthChangePercent}
        priceDomain={priceDomain}
      />
    </Card>
  );
}
